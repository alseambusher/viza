import json
from flask import Flask
from flask import render_template
from flask.json import jsonify

app = Flask(__name__, static_url_path='/static')

_file = open("data.csv")

data = map(lambda x: x[:-1].replace("'","").split(","), _file.readlines())

	
def message(m, e):
	return m, e, {'Access-Control-Allow-Origin': '*'}

def get_good_bad(classes, rows, traverse=[]):
	print traverse
	good = []
	bad = []
	good_num = 0
	bad_num = 0

	for i in rows:
		_data = data[i][:]
		del _data[1]
		del	_data[3]
		del _data[10]
		_data = _data[13:]
		if _data[:len(traverse)]==traverse:
			if classes[i] == "good":
				good.append(i)
				good_num += 1
			else:
				bad.append(i)
				bad_num += 1
	return good, bad, good_num, bad_num

def tree_build(node, columns, order, index, rows, traverse=[]):
	node["_children"] = []
	for unique in set(columns[index]):
		print unique, index
		good, bad, good_num, bad_num = get_good_bad(columns[-1], rows, traverse+[unique])
		entry = {"name": unique, "parent": node["name"], "percentage": [good_num, bad_num]}
		node["_children"].append(entry)
		if index+1 < len(columns)-1:
			tree_build(entry, columns, order, order.index(index)+1, good+bad, traverse+[unique])

def tree():
	columns = zip(*data)
	del columns[1]
	del columns[3]
	del columns[10]
	order = range(len(columns)-2) # TODO

	good, bad, good_num, bad_num = get_good_bad(columns[-1], range(len(data)))
	root = {"name": "root", "parent": "null", "percentage": [good_num, bad_num]}
	tree_build(root, columns[13:], order, 0, range(len(data)))
	return root

@app.route("/")
def index():
	return render_template("index.html")

@app.route("/data")
def getdata():
	return message(jsonify(json.load(open("tree.json"))), 200)

@app.route("/init")
def init():
	json.dump(tree(), open("tree.json", "w"))
	return "success"

if __name__ == "__main__":
	#init()
	app.run(host='0.0.0.0',port=5000,debug=True)
