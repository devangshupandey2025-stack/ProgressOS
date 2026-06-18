import PDFDocument from 'pdfkit';
import { prisma } from '../config/database.js';
import { MetricRegistry } from '../metrics/index.js';
import { marketReadinessService } from './market-readiness.service.js';
import { achievementsService } from './achievements.service.js';
import { gitHubService } from '../integrations/github/github.service.js';
import { TrackerSource } from '@prisma/client';

export class ReportService {
  public async generateCareerSnapshot(userId: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        // Fetch data concurrently
        const [
          readinessData,
          cgpaMetric,
          creditsMetric,
          leetcodeMetric,
          codeforcesMetric,
          projectsCountMetric,
          githubActivityMetric,
          rawGoals,
          achievementsData,
          projects
        ] = await Promise.all([
          marketReadinessService.compute(userId).catch(() => ({ overall: 0 })),
          MetricRegistry.resolve(TrackerSource.VIT_CGPA, userId).catch(() => ({ current: 0 })),
          MetricRegistry.resolve(TrackerSource.VIT_CREDITS, userId).catch(() => ({ current: 0 })),
          MetricRegistry.resolve(TrackerSource.LEETCODE_SOLVED, userId).catch(() => ({ current: 0 })),
          MetricRegistry.resolve(TrackerSource.CODEFORCES_RATING, userId).catch(() => ({ current: 0 })),
          MetricRegistry.resolve(TrackerSource.PROJECTS_COMPLETED, userId).catch(() => ({ current: 0 })),
          MetricRegistry.resolve(TrackerSource.GITHUB_ACTIVITY, userId).catch(() => ({ current: 0 })),
          prisma.goal.findMany({ where: { userId }, take: 5 }), // top 5 goals
          achievementsService.getAll(userId).catch(() => []),
          prisma.projectEntry.findMany({ where: { userId }, select: { techStack: true } })
        ]);

        // Resolve goals dynamically
        const goals = await Promise.all(rawGoals.map(async (g) => {
          let actualCurrent = g.current;
          if (g.trackerSource !== 'MANUAL') {
             const m = await MetricRegistry.resolve(g.trackerSource, userId).catch(() => ({ current: 0 }));
             actualCurrent = m.current;
          }
          return { ...g, current: actualCurrent };
        }));

        // Fetch top project
        let topProjectName = 'N/A';
        let topProjectActivity = '';
        if (user.githubUsername) {
          try {
            const ghAnalytics = await gitHubService.getAnalytics(userId, user.githubUsername);
            if (ghAnalytics.topProjects && ghAnalytics.topProjects.length > 0) {
              topProjectName = ghAnalytics.topProjects[0].name;
              topProjectActivity = `Quality Score: ${ghAnalytics.topProjects[0].score}/100`;
            }
          } catch {}
        }

        // Calculate top skills (ignoring generic languages)
        const IGNORED_SKILLS = new Set(['html', 'css', 'html5', 'css3', 'markdown', 'scss', 'sass', 'less']);
        const skillCounts: Record<string, number> = {};
        projects.forEach(p => {
          if (Array.isArray(p.techStack)) {
            p.techStack.forEach(t => {
              const cleaned = t.trim();
              if (!IGNORED_SKILLS.has(cleaned.toLowerCase())) {
                skillCounts[cleaned] = (skillCounts[cleaned] || 0) + 1;
              }
            });
          }
        });
        const topSkills = Object.entries(skillCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(entry => entry[0]);

        // Filter unlocked achievements and get top 4
        const unlockedAchievements = achievementsData
          .filter(a => a.unlocked)
          .slice(0, 4);

        // --- PDF Generation ---
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        const primaryColor = '#FF9933';
        const textColor = '#1E293B';
        const secondaryColor = '#64748B';

        // 1. Header (ProgressOS Branding)
        doc.font('Helvetica-Bold').fontSize(24).fillColor(primaryColor).text('ProgressOS', { align: 'center' });
        doc.font('Helvetica').fontSize(12).fillColor(secondaryColor).text('Career Snapshot', { align: 'center' });
        
        doc.moveDown(0.5);
        const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        doc.fontSize(10).fillColor('#94a3b8').text(`Generated: ${today}`, { align: 'center' });
        
        doc.moveDown(1.5);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).stroke('#E5E7EB');
        doc.moveDown(1.5);

        // 2. Personal Info & Market Readiness
        doc.font('Helvetica-Bold').fontSize(20).fillColor(textColor).text(user.name || user.username || 'Engineer Profile', { continued: true });
        
        // Align Market readiness to right
        doc.font('Helvetica-Bold').fontSize(14).fillColor(primaryColor).text(`Market Readiness: ${readinessData.overall} / 100`, { align: 'right' });
        doc.moveDown(1);
        
        // Career Highlights
        doc.font('Helvetica-Bold').fontSize(12).fillColor(textColor).text('Career Highlights');
        doc.moveDown(0.3);
        doc.font('Helvetica').fontSize(10).fillColor(secondaryColor);
        doc.text(`• ${leetcodeMetric.current} LeetCode Problems Solved`);
        doc.text(`• Codeforces Rating: ${codeforcesMetric.current > 0 ? codeforcesMetric.current : 'Unrated'}`);
        if (cgpaMetric.current > 0) doc.text(`• ${cgpaMetric.current} CGPA`);
        if (githubActivityMetric.current > 0) doc.text(`• ${githubActivityMetric.current} Active GitHub Projects`);
        else doc.text(`• ${projectsCountMetric.current} Completed Projects`);
        
        doc.moveDown(1);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E5E7EB');
        doc.moveDown(1.5);

        // Helper to draw sections
        const drawSection = (title: string, data: Record<string, any>, isTwoColumn = false) => {
          doc.font('Helvetica-Bold').fontSize(14).fillColor(textColor).text(title);
          doc.moveDown(0.5);
          
          doc.font('Helvetica').fontSize(11).fillColor(secondaryColor);
          
          if (isTwoColumn) {
            const entries = Object.entries(data);
            const startY = doc.y;
            
            entries.forEach((entry, idx) => {
              const xPos = idx % 2 === 0 ? 50 : 300;
              const yPos = startY + Math.floor(idx / 2) * 20;
              
              doc.font('Helvetica-Bold').fillColor(textColor).text(`${entry[0]}: `, xPos, yPos, { continued: true });
              doc.font('Helvetica').fillColor(secondaryColor).text(`${entry[1]}`);
            });
            doc.y = startY + Math.ceil(entries.length / 2) * 20;
          } else {
            Object.entries(data).forEach(([k, v]) => {
              doc.font('Helvetica-Bold').fillColor(textColor).text(`${k}: `, { continued: true });
              doc.font('Helvetica').fillColor(secondaryColor).text(`${v}`);
              doc.moveDown(0.2);
            });
          }
          
          doc.moveDown(1);
          doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E5E7EB');
          doc.moveDown(1.5);
        };

        // 3. Academics
        drawSection('Academics', {
          'CGPA': cgpaMetric.current > 0 ? cgpaMetric.current : 'N/A',
          'Credits': creditsMetric.current > 0 ? creditsMetric.current : 'N/A'
        }, true);

        // 4. DSA
        drawSection('DSA', {
          'LeetCode Solved': leetcodeMetric.current,
          'Codeforces Rating': codeforcesMetric.current > 0 ? codeforcesMetric.current : 'Unrated'
        }, true);

        // 5. Projects & Activity
        const projData: Record<string, any> = {
          'Completed Projects': projectsCountMetric.current,
          'GitHub Active Projects': githubActivityMetric.current
        };
        if (topProjectName !== 'N/A') {
           projData['Top Project'] = topProjectName;
           projData['Latest Activity'] = topProjectActivity;
        }
        drawSection('Projects', projData, true);

        // 6. Skills
        doc.font('Helvetica-Bold').fontSize(14).fillColor(textColor).text('Top Skills');
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(11).fillColor(secondaryColor);
        if (topSkills.length > 0) {
          doc.text(topSkills.join(' • '));
        } else {
          doc.text('No skills logged yet.');
        }
        doc.moveDown(1);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E5E7EB');
        doc.moveDown(1.5);

        // 7. Goals
        doc.font('Helvetica-Bold').fontSize(14).fillColor(textColor).text('Current Goals');
        doc.moveDown(0.5);
        if (goals.length > 0) {
          goals.forEach(g => {
            const pct = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
            doc.font('Helvetica-Bold').fontSize(11).fillColor(textColor).text(g.title, { continued: true });
            doc.font('Helvetica').fillColor(primaryColor).text(`  ${pct}%`);
            doc.moveDown(0.2);
          });
        } else {
          doc.font('Helvetica').fontSize(11).fillColor(secondaryColor).text('No active goals.');
        }
        doc.moveDown(1);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E5E7EB');
        doc.moveDown(1.5);

        // 8. Achievements
        doc.font('Helvetica-Bold').fontSize(14).fillColor(textColor).text('Recent Achievements');
        doc.moveDown(0.5);
        if (unlockedAchievements.length > 0) {
          unlockedAchievements.forEach(a => {
            doc.font('Helvetica-Bold').fontSize(11).fillColor(textColor).text(`• ${a.title}`);
            doc.moveDown(0.2);
          });
        } else {
          doc.font('Helvetica').fontSize(11).fillColor(secondaryColor).text('Keep building to unlock achievements!');
        }
        doc.moveDown(1);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E5E7EB');
        
        // 9. Footer
        doc.moveDown(2);
        doc.font('Helvetica').fontSize(10).fillColor('#94a3b8').text('Generated by ProgressOS', { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const reportService = new ReportService();
