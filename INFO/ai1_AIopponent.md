# Subject's constraints

the use of the A* algorithm is not permitted for this task

- AI opponent that provides a challenging and engaging gameplay experience for users
- AI must replicate human behavior, which means that in your AI implementation, you must simulate keyboard input.   
    The AI can only refresh its view of the game once per second, requiring it to anticipate bounces and other actions - anticipation area gets smaller and smaller the closer the pong is
- Implement AI logic and decision-making processes that enable the AI player to make intelligent and strategic moves
- Ensure that the AI adapts to different gameplay scenarios and user interactions
- it must have the capability to win occasionally

(!) A* algorithm is not allowed (https://www.geeksforgeeks.org/dsa/a-search-algorithm/)
(!) AI must utilize power-ups if you have chosen to implement the Game customization options module


# Interaction with other parts

## Interface:
### What do I receive?
- The information where the point is - as a (x,y) vector
- The information where the human opponent is - as a (x,y) vector
- ? Game customization options - depend on what the Game customization will look like

### What other information do I need?
- The window size - as a (x,y) vector

### What do I send?
- I will provide the calculated position of the AI opponent - as a (x,y) vector


# Implementation

Ich würde Python dafür benutzen. 
https://www.linkedin.com/pulse/creating-classical-pong-game-pygame-step-by-step-tutorial-nuno-bispo-xgg8e

