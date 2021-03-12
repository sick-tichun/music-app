
import math


def scum(radius, heigth):
    ratrat = math.pi*(radius**2)*heigth
    return ratrat

def t1balla(radius):
    monesterenergygunskisbroski = (4/3)*math.pi*(radius**3)
    return monesterenergygunskisbroski

print((scum(1, 0.2)*0.75)/t1balla(0.05))


