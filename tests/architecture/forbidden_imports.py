from pathlib import Path
import re
R=Path(__file__).resolve().parents[2]

RULES=[
 ("packages/domain", re.compile(r"(redis|kafka|@aws-sdk|aws-sdk|opensearch|kubernetes)",re.I), "domain cannot import infrastructure SDKs"),
 ("apps/web", re.compile(r"(pg|postgres|typeorm|prisma|sequelize|drizzle)",re.I), "frontend cannot import database packages"),
 ("apps/platform-control-api/src", re.compile(r"(from ['\"](?:@prisma/client|typeorm|sequelize|drizzle-orm)|require\(['\"](?:@prisma/client|typeorm|sequelize|drizzle-orm))",re.I), "controllers cannot access ORM directly"),
]
violations=[]
for root,pattern,message in RULES:
 p=R/root
 if not p.exists(): continue
 for f in list(p.rglob("*.ts"))+list(p.rglob("*.tsx"))+list(p.rglob("*.js")):
  for line in f.read_text(errors="ignore").splitlines():
   if ("import " in line or "require(" in line) and pattern.search(line):
    if "adapters/" not in str(f.relative_to(R)).replace("\\","/"):
     violations.append(f"{message}: {f.relative_to(R)}: {line.strip()}")
assert not violations,"\n".join(violations)
print("Mandatory architecture import rules passed")
