"""ClassCode browser Turtle drawing subset. No desktop/Tk dependencies."""
import math
import json
_commands = []
_count = 0
_sink = None
_mode = 1.0

def _flush():
    global _commands
    if not _commands: return
    if _sink: _sink(_commands[:])
    else:
        from js import postMessage, JSON
        postMessage(JSON.parse(json.dumps({'turtle': _commands})))
    _commands = []

def _emit(op, **values):
    global _count
    _count += 1
    if _count > 25000: raise RuntimeError('Turtle drawing limit reached (25,000 operations). Simplify your drawing.')
    _commands.append(dict(op=op, **values))
    if len(_commands) >= 128: _flush()

def _color(args):
    if len(args) == 1 and isinstance(args[0], str): return args[0]
    rgb = args[0] if len(args) == 1 else args
    if len(rgb) != 3: raise ValueError('Use a color name, hex color, or RGB triple')
    return '#%02x%02x%02x' % tuple(max(0, min(255, round(float(v)*255/_mode))) for v in rgb)

class Turtle:
    def __init__(self, shape='classic', undobuffersize=1000, visible=True):
        self._x = self._y = self._angle = 0.0
        self._down = True
        self._visible = visible
        self._pen = self._fill = '#8b5cf6'
        self._width = 2
        self._shape = shape
        self._points = None
        self._id = id(self)
        self._cursor()
    def _cursor(self):
        _emit('cursor', id=self._id, x=self._x, y=self._y, angle=self._angle, visible=self._visible, color=self._pen, shape=self._shape)
    def goto(self, x, y=None):
        if y is None: x, y = x
        x, y = float(x), float(y)
        if not math.isfinite(x) or not math.isfinite(y): raise ValueError('Coordinates must be finite')
        if self._down: _emit('line', id=self._id, x1=self._x, y1=self._y, x2=x, y2=y, color=self._pen, width=self._width)
        self._x, self._y = x, y
        if self._points is not None: self._points.append([x, y])
        self._cursor()
    setpos = setposition = goto
    def forward(self, distance):
        a = math.radians(self._angle)
        self.goto(self._x + float(distance)*math.cos(a), self._y + float(distance)*math.sin(a))
    fd = forward
    def backward(self, distance): self.forward(-float(distance))
    back = bk = backward
    def left(self, angle): self.setheading(self._angle + float(angle))
    lt = left
    def right(self, angle): self.left(-float(angle))
    rt = right
    def setheading(self, angle): self._angle = float(angle) % 360; self._cursor()
    seth = setheading
    def heading(self): return self._angle
    def position(self): return (self._x, self._y)
    pos = position
    def xcor(self): return self._x
    def ycor(self): return self._y
    def setx(self, x): self.goto(x, self._y)
    def sety(self, y): self.goto(self._x, y)
    def home(self): self.goto(0, 0); self.setheading(0)
    def penup(self): self._down = False
    pu = up = penup
    def pendown(self): self._down = True
    pd = down = pendown
    def isdown(self): return self._down
    def pensize(self, width=None):
        if width is None: return self._width
        self._width = max(0.1, float(width))
    width = pensize
    def pencolor(self, *args):
        if not args: return self._pen
        self._pen = _color(args); self._cursor()
    def fillcolor(self, *args):
        if not args: return self._fill
        self._fill = _color(args)
    def color(self, *args):
        if not args: return self._pen, self._fill
        if len(args) == 2: self.pencolor(args[0]); self.fillcolor(args[1])
        else: self.pencolor(*args); self.fillcolor(*args)
    def begin_fill(self): self._points = [[self._x, self._y]]
    def end_fill(self):
        if self._points: _emit('fill', id=self._id, points=self._points, color=self._fill, stroke=self._pen, width=self._width)
        self._points = None
    def filling(self): return self._points is not None
    def circle(self, radius, extent=None, steps=None):
        r = float(radius); extent = 360 if extent is None else float(extent)
        if r == 0: return
        steps = max(1, int(steps or max(8, abs(extent)/5)))
        if steps > 10000: raise ValueError('Too many circle steps')
        start = self._angle; a = math.radians(start)
        cx, cy = self._x-r*math.sin(a), self._y+r*math.cos(a)
        vx, vy = self._x-cx, self._y-cy
        turn = extent * (1 if r > 0 else -1)
        for i in range(1, steps+1):
            t = math.radians(turn*i/steps)
            self._angle = (start+turn*i/steps) % 360
            self.goto(cx+vx*math.cos(t)-vy*math.sin(t), cy+vx*math.sin(t)+vy*math.cos(t))
    def dot(self, size=None, *color):
        _emit('dot', id=self._id, x=self._x, y=self._y, size=float(size or max(self._width+4, self._width*2)), color=_color(color) if color else self._pen)
    def write(self, arg, move=False, align='left', font=('Arial', 12, 'normal')):
        if move: raise NotImplementedError('write(move=True) is not supported in browser Turtle')
        _emit('text', id=self._id, x=self._x, y=self._y, text=str(arg), align=align, size=float(font[1]), color=self._pen)
    def hideturtle(self): self._visible = False; self._cursor()
    ht = hideturtle
    def showturtle(self): self._visible = True; self._cursor()
    st = showturtle
    def isvisible(self): return self._visible
    def shape(self, name=None):
        if name is None: return self._shape
        self._shape = str(name); self._cursor()
    def speed(self, value=None): return 0
    def clear(self): _emit('clear', id=self._id)
    def reset(self): self.clear(); self.__init__()
    def getscreen(self): return _screen
    def getturtle(self): return self
    def distance(self, x, y=None):
        if isinstance(x, Turtle): x, y = x.position()
        elif y is None: x, y = x
        return math.hypot(float(x)-self._x, float(y)-self._y)
    def towards(self, x, y=None):
        if y is None: x, y = x
        return math.degrees(math.atan2(y-self._y, x-self._x)) % 360
    def __getattr__(self, name): raise NotImplementedError(f'turtle.{name} is not supported by browser Turtle yet')

class _Screen:
    _background = '#ffffff'
    def bgcolor(self, *args):
        if not args: return getattr(self, '_background', '#ffffff')
        self._background = _color(args); _emit('background', color=self._background)
    def setup(self, width=600, height=600, startx=None, starty=None):
        _emit('setup', width=max(100, min(2000, int(width))), height=max(100, min(2000, int(height))))
    def title(self, text): _emit('title', text=str(text))
    def tracer(self, n=None, delay=None): return 0
    def update(self): _flush()
    def mainloop(self): _flush()
    done = exitonclick = mainloop
    def clearscreen(self): _emit('clearall')
    clear = clearscreen
    def colormode(self, value=None):
        global _mode
        if value is not None:
            if value not in (1.0, 255): raise ValueError('Color mode must be 1.0 or 255')
            _mode = value
        return _mode
    def __getattr__(self, name): raise NotImplementedError(f'Screen.{name} is not supported by browser Turtle yet. Keyboard/mouse event loops are not supported.')

_screen = _Screen()
def Screen(): return _screen
_default = None
def _default_turtle():
    global _default
    if _default is None: _default = Turtle()
    return _default
def _delegate(name):
    def call(*args, **kwargs): return getattr(_default_turtle(), name)(*args, **kwargs)
    return call
for _name in ('forward fd backward back bk left lt right rt goto setpos setposition setheading seth heading position pos xcor ycor setx sety home penup pu up pendown pd down isdown pensize width pencolor fillcolor color begin_fill end_fill filling circle dot write hideturtle ht showturtle st isvisible shape speed clear reset getscreen getturtle distance towards').split(): globals()[_name] = _delegate(_name)
for _name in ('bgcolor setup title tracer update mainloop done exitonclick clearscreen colormode').split(): globals()[_name] = getattr(_screen, _name)
Pen = RawTurtle = Turtle
