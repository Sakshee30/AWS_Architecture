from pathlib import Path
import re
R=Path(__file__).resolve().parents[2]
RULES=[("packages/domain",re.compile(r"(redis|kafka|@aws-sdk|aws-sdk|opensearch|kubernetes)",re.I),"domain cannot import infrastructure SDKs"),("apps/web",re.compile(r"(pg|postgres|typeorm|prisma|sequelize)",re.I),"frontend cannot import database packages")]
violations=[]
for root,pattern,message in RULES:
 p=R/root
 if not p.exists(): continue
 for f in list(p.rglob("*.ts"))+list(p.rglob("*.tsx")):
  for line in f.read_text(errors="ignore").splitlines():
   if ("import " in line or "require(" in line) and pattern.search(line): violations.append(f"{message}: {f.relative_to(R)}: {line.strip()}")
assert not violations,"\n".join(violations)
print("Mandatory architecture import rules passed")
