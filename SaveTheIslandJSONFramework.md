Heres our general idea of how it will look. As we flesh it out more we well update this file.


             {
               'turn1': {
                 'animatable_events': [     // Each animatable_event must have an event name and data object
                    {
                      'event': 'move',
                      'data': { 
                        'object_name' : 'player2',
                        'final_position' : 11 
                      } 
                    },
                 ],
                 'turn_data' : {
                   'player1Tiles' : [1, 3, 5, 5, 3],    // The tiles after this turn
                   'player2Tiles' : [2, 4, 3, 5, 1],
                   'turn_description' : "Player 2 used a 3 tile to move to position 11.",  // May not be necessary but would be nice.
                 },
                 'debugging' : 
                   [
                      "An array", 
                      "of lines output by the bot", 
                      "stderr on this turn."
                   ],
               },
                'turn2': {
                  'game_data' : {
                    'player1Tiles' : [1, 3, 2, 2, 3],
                    'player2Tiles' : [2, 4, 3, 5, 1],
                    'move' : "Player 1 used two 5 tile's to attack but was defended.",
                  },
                  'debugging' : 
                    [
                       "An array", 
                       "of lines output by the bot", 
                       "stderr on this turn."
                    ],
                  'animatable_events': 
                    [
                       {
                         'event': 'move',
                         'data': 
                         { 
                          'object_name' : 'player1',
                          'final_position' : 10 
                         } 
                       },
                        {
                          'event': 'defend',
                          'data': 
                           { 
                            'attacker' : 'player1',
                            'defender' : 'player2',
                            'attacker_final_position' : 6  // After a defend the attacker should move back to their original position
                           } 
                        },
                  ],
                },
              });
    }, 2000); 

  }); 

}

