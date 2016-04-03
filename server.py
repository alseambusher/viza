import json
import math
from flask import Flask, request
from flask import render_template
from flask.json import jsonify

app = Flask(__name__, static_url_path='/static')

_file = open("data.csv")

data = map(lambda x: x[:-1].replace("'","").split(","), _file.readlines())

order = [0, 2, 5, 14, 3, 16, 13, 6, 11]
#order = [0, 2, 5, 14, 3, 16, 13, 6, 11, 10, 8, 18, 17, 15, 1, 12]


def message(m, e):
	return m, e, {'Access-Control-Allow-Origin': '*'}

def get_good_bad(classes, rows, traverse=[], indices=[]):
	good = []
	bad = []
	good_num = 0
	bad_num = 0

	for i in rows:
		_data = []
		for index in indices:
			_data.append(data[i][index])

		if _data==traverse:
			if classes[i] == "good":
				good.append(i)
				good_num += 1
			else:
				bad.append(i)
				bad_num += 1

	gain = -float("inf")
	split = None
	"""
	for column in columns[13:]:
		if columns.index(column) not in indices:
			freq={}
			for r in range(len(column)):
				if column[r] in freq:
					freq[r][0 if columns[-1]=="good" else 1] += 1
				else:
					if columns[-1]=="good":
						freq[r] = [2, 1]
					else:
						freq[r] = [1, 2]

				g = 0
				if good_num > 0: 
					g = -sum([ float(freq[i][0])/good_num * math.log(float(freq[i][0])/good_num) for i in freq.iterkeys() ])
				if bad_num > 0:
					g -= sum([ float(freq[i][1])/bad_num* math.log(float(freq[i][1])/bad_num) for i in freq.iterkeys() ])
				if g > gain:
					gain = g
					split = r
"""
	return good, bad, good_num, bad_num, split

def tree_build(node, columns, order, index, rows, traverse=[], indices=[]):
	node["_children"] = []
	print index
	for unique in set(columns[index]):
		print unique, index
		good, bad, good_num, bad_num, split = get_good_bad(columns[-1], rows, traverse+[unique], indices+[index])
		entry = {"name": unique, "parent": node["name"], "percentage": [good_num, bad_num], "value":traverse+[unique]}
		node["_children"].append(entry)
		if order.index(index)+1 < len(order):
			tree_build(entry, columns, order, order[order.index(index)+1], good+bad, traverse+[unique], indices+[index])

def tree():
	columns = zip(*data)
	good, bad, good_num, bad_num, split = get_good_bad(columns[-1], range(len(data)))
	root = {"name": "root", "parent": "null", "percentage": [good_num, bad_num], "value":[]}
	tree_build(root, columns, order, order[0], range(len(data)))
	return root

@app.route("/")
def index():
	return render_template("index.html")

@app.route("/data")
def getdata():
	return message(jsonify(json.load(open("tree.json"))), 200)

@app.route("/match")
def match():
	_data = request.args.get("q").split(",")
	result = {"data":[]}
	for row in data:
		_is_match = True
		for i in range(len(_data)):
			if _data[i] != row[order[i]]:
				_is_match = False
				break
			if _is_match:
				result["data"].append([row[x] for x in order])
	return message(jsonify(result), 200)
	

@app.route("/init")
def init():
	json.dump(tree(), open("tree.json", "w"))
	return "success"

if __name__ == "__main__":
	#init()
	app.run(host='0.0.0.0',port=5000,debug=True)
