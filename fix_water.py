with open('src/components/glass/WaterBubble.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('stopOpacity="0} />"', 'stopOpacity="0" />')
with open('src/components/glass/WaterBubble.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
