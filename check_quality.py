import json

with open("backend/data/gate/algorithms.json", encoding="utf-8") as f:
    data = json.load(f)

shown = 0
for q in data:
    if q.get("optionA") and q.get("answer"):
        print(f"--- Year: {q['year']}, Topic: {q['topic']}, Ans: {q['answer']} ---")
        print(f"Q: {q['question'][:200]}")
        print(f"A: {q['optionA']}")
        print(f"B: {q['optionB']}")
        print(f"C: {q['optionC']}")
        print(f"D: {q['optionD']}")
        print()
        shown += 1
        if shown >= 3:
            break

if shown == 0:
    print("No questions with both options and answers found")
    # Show any question
    if data:
        q = data[0]
        print(f"Sample: {json.dumps(q, indent=2)[:500]}")
