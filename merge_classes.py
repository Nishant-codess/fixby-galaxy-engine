import re

def merge_class_attrs(match):
    tag = match.group(0)
    # Find all class="..." occurrences
    classes = []
    def replacer(m):
        classes.extend(m.group(1).split())
        return ""
    
    # Remove all class attributes and capture their contents
    tag_without_classes = re.sub(r'class="([^"]*)"', replacer, tag)
    
    if classes:
        # Deduplicate and join
        unique_classes = []
        for c in classes:
            if c not in unique_classes:
                unique_classes.append(c)
        merged_class_attr = ' class="' + ' '.join(unique_classes) + '"'
        
        # Insert merged class attribute after the tag name
        # tag_without_classes looks like <div id="foo" >
        parts = tag_without_classes.split(' ', 1)
        if len(parts) == 1:
            # e.g., <div> or <div/>
            if parts[0].endswith('/>'):
                return parts[0][:-2] + merged_class_attr + '/>'
            elif parts[0].endswith('>'):
                return parts[0][:-1] + merged_class_attr + '>'
        else:
            return parts[0] + merged_class_attr + ' ' + parts[1]
            
    return tag

with open('src/frontend/index.html', 'r') as f:
    content = f.read()

# Apply to all HTML tags
fixed_content = re.sub(r'<[^>]+>', merge_class_attrs, content)

with open('src/frontend/index.html', 'w') as f:
    f.write(fixed_content)

print("Merged classes")
