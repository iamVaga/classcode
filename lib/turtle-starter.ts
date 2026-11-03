export const turtleStarter=`import turtle

screen = turtle.Screen()
screen.bgcolor("#111425")
screen.title("My first Turtle artwork")

artist = turtle.Turtle()
artist.shape("turtle")
artist.speed(0)
artist.pensize(3)
colors = ["#a78bfa", "#67e8f9", "#f9a8d4", "#fcd34d"]

for i in range(80):
    artist.pencolor(colors[i % len(colors)])
    artist.forward(i * 2)
    artist.right(91)

turtle.done()
print("Your first generative artwork. Made with code!")
`;
