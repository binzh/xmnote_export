bigfile = open('untitled.html', 'r')

lines = bigfile.readlines()
# print(lines)
allInLine = ""
for line in lines:
    allInLine += line
    # if ("TITLE: " in line ):
    #     fp.write(line)
    #     fp = open(file_name2, 'ab+')
print(allInLine)

notes = allInLine.split('<div class="card" id="xmnote">')

print('----------------notes----------------notes----------------notes----------------notes')
for idx,note in enumerate(notes):
    if note!="":
        note = ('<html><head><style>.card{margin-top:10px;}table{}p{display: inline;}</style></head><body>') + note
        note += ('</body></html>')
        print(note)
        fp = open("NOTE%d.html" % idx, 'a')
        fp.truncate(0)
        fp.write(note)
        fp.close()
