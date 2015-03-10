Heres our general idea of how it will look. As we flesh it out more we well update this file.

    {
      'Round1': {
        'animations': [
          {
            'player': 'player1',
            'event': 'move',
            'data': 3 // The board position to move to (will be 0 to 24)
          },
          {
            'player': 'player1',
            'event': 'successful_attack', (Otherwise would be defended_attack)
            'data': null  // Don't need any additional data here
          },
          {
            'player': 'player2', //(And if it was defended this would be player1 moving back to where it was.
            'event': 'move',
            'data': 10
          }
        ]
      },
      'Round2': {
        'animations': [
          {
            'player': 'player2',
            'event': 'move',
            'data': 6 // The board position to move to (will be 0 to 24)
          }
        ]
      },
      // ... More rounds
    }