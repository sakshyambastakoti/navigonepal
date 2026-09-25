import os

root_files = [
    '404.html', 'admin.html', 'blog.html', 'discord-workshop.html',
    'donate.html', 'email-templates.html', 'index.html', 'intern.html',
    'join.html', 'maintenance.html', 'our-story.html', 'past-events.html',
    'programs.html', 'propose-project.html', 'team.html', 'thank-you.html',
    'verify.html', 'volunteer.html'
]

root_replacement = (
    '  <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32x32.png">\n'
    '  <link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16x16.png">\n'
    '  <link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">\n'
    '  <link rel="shortcut icon" href="favicon.ico">'
)

old_root_pattern = (
    '  <link rel="icon" type="image/png" href="assets/png_new_logo.png">\n'
    '  <link rel="apple-touch-icon" href="assets/png_new_logo.png">'
)

for f in root_files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as fp:
            content = fp.read()
        if old_root_pattern in content:
            content = content.replace(old_root_pattern, root_replacement)
            with open(f, 'w', encoding='utf-8') as fp:
                fp.write(content)
            print('Updated:', f)
        elif '<link rel="shortcut icon" href="favicon.ico" type="image/x-icon">' in content:
            content = content.replace('<link rel="shortcut icon" href="favicon.ico" type="image/x-icon">', root_replacement)
            with open(f, 'w', encoding='utf-8') as fp:
                fp.write(content)
            print('Updated shortcut icon in:', f)
        else:
            print('Pattern not matched in:', f)

sub_files = ['id-cards/index.html', 'id-cards/verify.html', 'idcard/index.html']
sub_old = (
    '  <link rel="icon" type="image/png" href="../assets/png_new_logo.png">\n'
    '  <link rel="apple-touch-icon" href="../assets/png_new_logo.png">'
)
sub_new = (
    '  <link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32x32.png">\n'
    '  <link rel="icon" type="image/png" sizes="16x16" href="../assets/favicon-16x16.png">\n'
    '  <link rel="apple-touch-icon" sizes="180x180" href="../assets/apple-touch-icon.png">\n'
    '  <link rel="shortcut icon" href="../favicon.ico">'
)

for sf in sub_files:
    if os.path.exists(sf):
        with open(sf, 'r', encoding='utf-8') as fp:
            c = fp.read()
        if sub_old in c:
            c = c.replace(sub_old, sub_new)
            with open(sf, 'w', encoding='utf-8') as fp:
                fp.write(c)
            print('Updated subdir file:', sf)
        else:
            print('Sub pattern not matched in:', sf)
