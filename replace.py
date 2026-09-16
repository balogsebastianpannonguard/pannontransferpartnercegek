import re
with open("app/ni/components/NiPremiumLogin.tsx", "r") as f:
    content = f.read()

# Replace light mode classes with dark mode classes
content = content.replace("text-zinc-900", "text-white")
content = content.replace("text-zinc-500", "text-slate-400")
content = content.replace("text-zinc-700", "text-slate-300")
content = content.replace("text-zinc-800", "text-white")
content = content.replace("text-zinc-600", "text-slate-300")
content = content.replace("text-zinc-400", "text-slate-500")

content = content.replace("bg-white border border-zinc-200", "bg-white/5 border border-white/10 backdrop-blur-xl")
content = re.sub(r'(?<!-)bg-white(?!/)', 'bg-white/5', content)
content = content.replace("border-zinc-200", "border-white/10")
content = content.replace("border-zinc-300", "border-white/20")
content = content.replace("bg-zinc-100", "bg-white/10")
content = content.replace("hover:bg-zinc-50", "hover:bg-white/10")
content = content.replace("bg-zinc-900", "bg-white/10")

with open("app/ni/components/NiPremiumLogin.tsx", "w") as f:
    f.write(content)
