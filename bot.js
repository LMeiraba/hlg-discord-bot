require('dotenv').config()
const hlg = require("higher-lower-game")
const {Bot,Client,Interaction} = require("@meiraba/discord")
const game = new hlg()
const bot = new Bot({token: process.env.token})//add your token inside the ".env" file.
const client = new Client({token:bot.token})
const interaction = new Interaction()
client.start()

client.on('READY', async(data) => {
    console.log(`${data.user.username} is ready`)
    //create a new command named "high-low"
    await bot.command.create({
        type: 1,
        name: 'high-low',
        description: 'Guess which one is higher than the other',
        options: [
            {
                type: 3,
                name: 'category',
                description: 'Select a category to play in, a random one is selected if not provided.',
                choices: [
                    {
                        name: 'Google Searches',
                        value: '1',
                    },
                    {
                        name: 'Youtube Subscriber',
                        value: '2',
                    },
                    {
                        name: 'Youtube Views',
                        value: '3',
                    },
                    {
                        name: 'Website Visits',
                        value: '4',
                    },
                    {
                        name: 'Twitch Followers',
                        value: '5',
                    },
                    {
                        name: 'Rich People',
                        value: '6',
                    },
                    {
                        name: 'High Salary',
                        value: '7',
                    },
                    {
                        name: 'Country Size',
                        value: '8',
                    },
                    {
                        name: 'Country Population',
                        value: '9',
                    },
                    {
                        name: 'Country Population Density',
                        value: '10',
                    },
                    {
                        name: 'IMDB Rating(Movies)',
                        value: '11',
                    },
                    {
                        name: 'IMDB Rating(TV Series & Shows)',
                        value: '12',
                    },
                    {
                        name: 'Movie Cost',
                        value: '13',
                    },
                    {
                        name: 'Movie Cost(With Inflation)',
                        value: '14',
                    },
                    {
                        name: 'Movie Collection',
                        value: '15',
                    },
                    {
                        name: 'Actor Charge',
                        value: '16',
                    },
                    {
                        name: 'Tomatometer Score(Movies)',
                        value: '17',
                    },
                    {
                        name: 'Instragram Followers',
                        value: '18',
                    },
                    {
                        name: 'Spotify Listners',
                        value: '19',
                    }
                ]
            }
        ]
    })
})
client.on('INTERACTION_CREATE', async(data) => {
    const callback = new interaction.callback(data)
    const followup = new interaction.followup(data)
    if (callback.type === 'slash_command' && data.data.name === 'high-low') {
        await callback.command_defer()
        let message = await followup.edit_original({content: 'generating content...'})
        let Gdata = await game.start(message.id,{basedOn: data?.data?.options?.[0]?.value ?? null})
        console.log(Gdata.vs)
        await followup.edit_original({
            content: '',
            embeds: [
                {
                  color: 0x00ff00,
                  title: `${Gdata.vs[0].title} ${Gdata.data.verb} ${Gdata.data.prefix}\`${Gdata.vs[0].count.toLocaleString("en-US")}\`${Gdata.data.suffix} ${Gdata.data.value}.`,
                  image: {
                    url: Gdata.vs[0].image
                  }
                },
                {
                  color: 0xff0000,
                  title: `VS`
                },
                {
                  color: 0x00ff00,
                  title: `${Gdata.vs[1].title} ${Gdata.data.verb} Higher or Lower ${Gdata.data.value}?`,
                  image: {
                    url: Gdata.vs[1].image
                  }
                }
              ],
              components: [
                {
                  type: 1,
                  components: [
                    {type: 2,style: 3,label: `Higher`,custom_id: `hlg-HIGH`,disabled: false,emoji:{name:'🔼'}},
                    {type: 2,style: 3,label: `Lower`,custom_id: `hlg-LOW`,disabled: false,emoji:{name:'🔽'}},
                    {type: 2,style: 1,label: `Score: 0`,custom_id: `hl-score`,disabled: true,},
                  ]
                }
              ]
        })
    }
    if (callback.type === 'button') {
        if(!game.now?.[data.message.id]) {
            return callback.component_update({
                content:'opse! no data found for this game.',
                embeds: [],
                components: []
            })
        }
        await callback.component_defer()
        if ((data?.member?.user?.id ?? data?.user.id) !== data.message.interaction.user.id) {
            return followup.create({
                content: 'Hey, start your own game.',
                ephemeral: true
            })
        }
        let guess
        if(data.data.custom_id === 'hlg-LOW') guess = false
        if(data.data.custom_id === 'hlg-HIGH') guess = true
        let correct = await game.check(data.message.id,guess)
        if(correct) {
            await followup.create({
                content: 'Correct! generating next content...',
                ephemeral: true
            })
            let Gdata = await game.next(data.message.id)
            console.log(Gdata.vs)
            await followup.edit_original({
                embeds: [
                {
                    color: 0x00ff00,
                    title: `${Gdata.vs[0].title} ${Gdata.data.verb} ${Gdata.data.prefix}\`${Gdata.vs[0].count.toLocaleString("en-US")}\`${Gdata.data.suffix} ${Gdata.data.value}.`,
                    image: {
                        url: Gdata.vs[0].image
                    }
                },
                {
                    color: 0xff0000,
                    title: `VS`
                },
                {
                    color: 0x00ff00,
                    title: `${Gdata.vs[1].title} ${Gdata.data.verb} Higher or Lower ${Gdata.data.value}?`,
                    image: {
                        url: Gdata.vs[1].image
                    }
                }
                ],
                components: [
                {
                  type: 1,
                  components: [
                    {type: 2,style: 3,label: `Higher`,custom_id: `hlg-HIGH`,disabled: false,emoji:{name:'🔼'}},
                    {type: 2,style: 3,label: `Lower`,custom_id: `hlg-LOW`,disabled: false,emoji:{name:'🔽'}},
                    {type: 2,style: 1,label: `Score: ${Gdata.score}`,custom_id: `hl-score`,disabled: true,},
                  ]
                }
              ]
        })
        }else {
            await followup.create({
                content: 'Wrong! play again?..',
                ephemeral: true
            })
            await followup.edit_original({
                content: 'Game Over!',
                components: [
                    {
                        type: 1,
                        components: [
                          {type: 2,style: 1,label: `Score: ${game.now[data.message.id].score}`,custom_id: `hl-score`,disabled: true,},
                        ]
                      }
                ]
            })
            await game.end(data.message.id)
        }
    }
})
