import importlib.util
from pathlib import Path
import unittest

class TurtleTests(unittest.TestCase):
    def setUp(self):
        spec=importlib.util.spec_from_file_location('browser_turtle',Path(__file__).parents[1]/'public'/'turtle.py')
        self.t=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.t)
        self.commands=[]
        self.t._sink=lambda commands:self.commands.extend(commands)
    def flush(self): self.t._flush(); return self.commands
    def test_square_returns_home_and_draws_four_lines(self):
        p=self.t.Turtle()
        for _ in range(4): p.forward(100); p.right(90)
        self.assertAlmostEqual(p.xcor(),0)
        self.assertAlmostEqual(p.ycor(),0)
        self.assertEqual(len([c for c in self.flush() if c['op']=='line']),4)
    def test_penup_and_instances_are_independent(self):
        a,b=self.t.Turtle(),self.t.Turtle()
        a.penup();a.goto(40,70);b.forward(10)
        self.assertEqual(a.position(),(40,70));self.assertEqual(b.position(),(10,0))
        self.assertEqual(len([c for c in self.flush() if c['op']=='line']),1)
    def test_circle_preserves_full_rotation_position(self):
        p=self.t.Turtle();p.circle(70)
        self.assertAlmostEqual(p.xcor(),0,places=7);self.assertAlmostEqual(p.ycor(),0,places=7)
        self.assertAlmostEqual(p.heading(),0)
    def test_fill_and_rgb_colors(self):
        self.t.colormode(255);p=self.t.Turtle();p.color(255,0,128)
        p.begin_fill();p.goto(10,0);p.goto(10,10);p.end_fill()
        fill=next(c for c in self.flush() if c['op']=='fill')
        self.assertEqual(fill['color'],'#ff0080');self.assertEqual(len(fill['points']),3)
    def test_module_aliases_and_done_flush(self):
        self.t.fd(50);self.t.lt(90);self.t.fd(20);self.t.done()
        self.assertEqual(self.t.position(),(50,20));self.assertTrue(self.commands)
    def test_drawing_limit_and_unsupported_events(self):
        self.t._count=25000
        with self.assertRaises(RuntimeError): self.t.forward(1)
        with self.assertRaises(NotImplementedError): self.t.Screen().onkey(lambda:None,'a')

if __name__=='__main__': unittest.main()
