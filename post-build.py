import sys
import os
import json
import pprint

def processFile(filePath, extension, configcontext):
	cleanLinesContaining = []
	cleanInBetweenInclusive = []
	cleanSuccessiveEmptyLines = False
	cleanComments = False
	minify = False
	if 'cleanSuccessiveEmptyLines' in configcontext:
		cleanSuccessiveEmptyLines = True
	if 'cleanComments' in configcontext:
		cleanComments = True
	if 'minify' in configcontext:
		minify = True
	if 'cleanLinesContaining' in configcontext:
		cleanLinesContaining = configcontext['cleanLinesContaining']
	if 'cleanInBetweenInclusive' in configcontext:
		cleanInBetweenInclusive = configcontext['cleanInBetweenInclusive']

	indicesToClear = set()
	lines = []

	with open(filePath) as file:
		lines = file.readlines()

	startInd = -1
	endInd = -1
	for pair in cleanInBetweenInclusive:
		for index, line in enumerate(lines):
			if pair[0] in line.strip():
				startInd = index
			if pair[1] in line.strip():
				endInd = index

		if startInd >= 0 and endInd >= startInd:
			for i in range(startInd, endInd+1):
				indicesToClear.add(i)

	hasHitEmptyLine = False
	emptyLineStartIndex = -1
	for index, line in enumerate(lines):
		if index in indicesToClear:
			continue

		if not hasHitEmptyLine and line.strip() == "":
			hasHitEmptyLine = True
			continue
		elif hasHitEmptyLine and line.strip() == "":
			indicesToClear.add(index)
			continue
		elif hasHitEmptyLine:
			hasHitEmptyLine = False

		#check for bad lines
		for badLine in cleanLinesContaining:
			if line in badLine:
				indicesToClear.add(index)
				break

	newlines = []
	for index, line in enumerate(lines):
		if index not in indicesToClear:
			newlines.append(line)

	with open(filePath, 'w') as file:
		file.truncate()
		file.seek(0)
		file.writelines(newlines)

	#print(list(indicesToClear))

	return

if __name__ == '__main__':
	assert(len(sys.argv) > 1)
	rootdir = sys.argv[1]

	data = {}
	configFile = 'cleanconfig.txt'
	#read cleanconfig.json for cleaning settings
	with open(configFile) as json_file:
		try:
			data = json.load(json_file)
			#print("config loaded!")
		except Exception:
			print("error loading " + os.path.join(rootdir, configFile))

	#pprint.pprint(data)

	cleanEmptyFolders = False
	if 'cleanEmptyFolders' in data:
		cleanEmptyFolders = True

	#print("cleanEmptyFolders: " + str(cleanEmptyFolders))
	if 'fileExtensions' in data:
		print("extensions to process: ")
		for ext in data['fileExtensions'].keys():
			print(ext)
	else:
		print("no extensions to process.")

	print()
	for root, dirs, files in os.walk(rootdir):
		for file in files:
			fpath = os.path.join(root, file)
			if 'cleanFilesNamed' in data and file in data['cleanFilesNamed']:
				print("removing: " + str(fpath))
				os.remove(fpath)
			elif 'fileExtensions' in data:
				ind = file.rfind('.')
				if (ind < 0):
					continue

				ext = file[file.rfind('.'):]
				if ext in data['fileExtensions']:
					print("processing " + fpath)
					processFile(fpath, ext, data['fileExtensions'][ext])
	#check again for empty folders
	if cleanEmptyFolders:
		for root, dirs, files in os.walk(rootdir):
			if not os.listdir(root):
				print('removing: ' + root)
				os.rmdir(root)




	#loop through each extension type and perform cleaning settings on each
	# for ext in data['fileExtensions']:
	# 	lines = []
	# 	for file in glob.iglob(rootdir + '/**/*' + ext, recursive=True):

	# 		with open(file) as page:
	# 			lines = page.readlines()

	# 		startInd = -1
	# 		endInd = -1

	# 		for line in lines:
	# 			if '<!-- Visual Studio Browser Link -->' in line:
	# 				startInd = lines.index(line)

	# 			if '<!-- End Browser Link -->' in line:
	# 				endInd = lines.index(line)

	# 		if startInd >= 0 and endInd >= 0:
	# 			del lines[startInd:endInd+1]

	# 			with open(file, 'w') as page:
	# 				page.truncate()
	# 				page.writelines(lines)
