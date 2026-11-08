const names=[
 ['total = 0\nprint(totla)','totla','total'],['score = 8\nprint(socre)','socre','score'],['colour = "teal"\nprint(color)','color','colour'],['name = "Ari"\nprint(nmae)','nmae','name'],['count = 3\nprint(cout)','cout','count'],
 ['answer = 42\nprint(answr)','answr','answer'],['stars = 5\nprint(star)','star','stars'],['pet = "fox"\nprint(pet_name)','pet_name','pet'],['distance = 10\nprint(distnace)','distnace','distance'],['message = "Hi"\nprint(mesage)','mesage','message']
].map(([source,missing,expected])=>({source,traceback:`NameError: name '${missing}' is not defined`,kind:'name',secret:expected==='name'?'name =':expected}));
const syntax=[
 ['print("hello"',"SyntaxError: '(' was never closed"],['if True\n    print(1)','SyntaxError: expected :'],['print("hello)','SyntaxError: unterminated string literal'],['for item in range(3)\n    print(item)','SyntaxError: expected :'],['values = [1, 2\nprint(values)',"SyntaxError: '[' was never closed"],['def greet(name)\n    print(name)','SyntaxError: expected :'],['print(2 + )','SyntaxError: invalid syntax'],['if score > 5 print(score)','SyntaxError: invalid syntax']
].map(([source,traceback])=>({source,traceback,kind:'syntax',secret:'fix'}));
const indentation=[
 ['for n in range(3):\nprint(n)','IndentationError: expected an indented block'],['if ready:\n    print("go")\n  print("done")','IndentationError: unindent does not match'],['def greet():\nprint("hi")','IndentationError: expected an indented block'],['while False:\n    pass\n  print("end")','IndentationError: unexpected indent'],['for item in items:\n\tprint(item)\n    print("next")','TabError: inconsistent use of tabs and spaces']
].map(([source,traceback])=>({source,traceback,kind:'indentation',secret:'four spaces'}));
const typed=[
 ['age = "12"\nprint(age + 1)','TypeError: can only concatenate str (not "int") to str','str(age)'],['items = 3\nprint(len(items))','TypeError: object of type int has no len()','items = [3]'],['print("age: " + 12)','TypeError: can only concatenate str (not "int") to str','str(12)'],['number = None\nprint(number + 1)','TypeError: unsupported operand type(s)','None + 1'],['items = [1, 2]\nitems("first")','TypeError: list object is not callable','items[0]'],['print(round("3.14"))','TypeError: must be real number, not str','float("3.14")'],['print("hi" * "3")',"TypeError: can't multiply sequence by non-int",'int(3)']
].map(([source,traceback,secret])=>({source,traceback,kind:'type',secret}));
const indexes=[
 ['items = ["a"]\nprint(items[1])','IndexError: list index out of range'],['letters = []\nprint(letters[0])','IndexError: list index out of range'],['colors = ["red", "blue"]\nprint(colors[2])','IndexError: list index out of range'],['word = "hi"\nprint(word[2])','IndexError: string index out of range'],['scores = [9, 8]\nprint(scores[-3])','IndexError: list index out of range']
].map(([source,traceback],index)=>({source,traceback,kind:'index',secret:['items[0]','letters[0]','colors[1]','word[1]','scores[-2]'][index]}));
const keys=[
 ['pet = {"name": "Fox"}\nprint(pet["age"])','KeyError: age'],['scores = {"Ari": 4}\nprint(scores["Sam"])','KeyError: Sam'],['settings = {"dark": True}\nprint(settings["theme"])','KeyError: theme'],['book = {"title": "Sky"}\nprint(book["author"])','KeyError: author']
].map(([source,traceback],index)=>({source,traceback,kind:'key',secret:['pet.get("age")','scores.get("Sam")','settings.get("theme")','book.get("author")'][index]}));
const attributes=[
 ['name = "fox"\nname.append("!")','AttributeError: str object has no attribute append'],['items = [1, 2]\nitems.upper()','AttributeError: list object has no attribute upper'],['count = 3\ncount.append(4)','AttributeError: int object has no attribute append'],['pet = "cat"\npet.push("!")','AttributeError: str object has no attribute push']
].map(([source,traceback],index)=>({source,traceback,kind:'attribute',secret:['name.upper()','items.append(3)','[count]','pet.upper()'][index]}));
const zero=[
 ['print(8 / 0)','ZeroDivisionError: division by zero'],['remainder = 5 % 0','ZeroDivisionError: integer modulo by zero'],['print(4 // 0)','ZeroDivisionError: integer division or modulo by zero']
].map(([source,traceback])=>({source,traceback,kind:'zero-division',secret:'if divisor != 0'}));
const imports=[
 ['import turtle_tools','ModuleNotFoundError: No module named turtle_tools'],['from magic_library import draw','ImportError: No module named magic_library']
].map(([source,traceback])=>({source,traceback,kind:'import',secret:'pip install'}));
const values=[
 ['age = int("twelve")','ValueError: invalid literal for int() with base 10: twelve'],['number = float("three")','ValueError: could not convert string to float: three']
].map(([source,traceback],index)=>({source,traceback,kind:'value',secret:['int("12")','float("3.0")'][index]}));
export const beginnerMistakes=[...names,...syntax,...indentation,...typed,...indexes,...keys,...attributes,...zero,...imports,...values];
