const Roles = [
  {
    id: 'citizen-1',
    name: 'Citizen',
    team: 'city',
    description: 'The Citizen has no abilities or traits. They are on the side of the City.'
  },
  {
    id: 'citizen-2',
    name: 'Citizen',
    team: 'city',
    description: 'The Citizen has no abilities or traits. They are on the side of the City.'
  },
  {
    id: 'citizen-3',
    name: 'Citizen',
    team: 'city',
    description: 'The Citizen has no abilities or traits. They are on the side of the City.'
  },
  {
    id: 'detective',
    name: 'Detective',
    team: 'city',
    description: 'The Detective has the ability of Flash Badge. They are on the side of the City.',
    abilities: [
      'Flash Badge - You take your phone and flash your Badge screen at a player. Overcome with the power of the law, that player will reveal their role to you by showing their screen. This information is shared with the Law. The affected player CANNOT do any actions or fire their weapon before showing their screen. However, you can be killed by ANOTHER player during the exchange. Member of the Law.'
    ]
  },
  {
    id: 'undercover-cop',
    name: 'Undercover Cop',
    team: 'city',
    description: 'The Undercover Cop attends the Mob Meeting. The Undercover Cop CANNOT shoot any Mob members (including those that are unknown). If the undercover cop shoots a mob member, their cover is blown and the City lose. The Undercover Cop can ONLY speak to Mob members as to not blow their cover but can communicate with City Members using non verbals. They are on the side of the City, however, their role screen will show as a Mob member. Member of the Law.'
  },
  {
    id: 'witch',
    name: 'Witch',
    team: 'city',
    description: 'The Witch has the “Death Curse” ability. They are on the side of the City.',
    abilities: [
      'Death Curse - When killed by another player, if the Witch knows who killed them, they curse the killer. The killer is affected with death curse at some point in the game. Their phone will announce that they are cursed and a timer will begin. The player dies when the timer hits “0”'
    ]
  },
  {
    id: 'mob-recruit-1',
    name: 'Mob Recruit',
    team: 'mob',
    description: 'The Recruit attends the Mob Meeting. They are a member of the mob.'
  },
  {
    id: 'mob-recruit-2',
    name: 'Mob Recruit',
    team: 'mob',
    description: 'The Recruit attends the Mob Meeting. They are a member of the mob.'
  },
  {
    id: 'mob-recruit-3',
    name: 'Mob Recruit',
    team: 'mob',
    description: 'The Recruit attends the Mob Meeting. They are a member of the mob.'
  },
  {
    id: 'mob-capo',
    name: 'Mob Capo',
    team: 'mob',
    description: 'The Capo has the ability of “Recruit”. The Capo attends the Mob Meeting. They are a member of the Mob.',
    abilities: [
      'Recruit - If the Capo is the only person to open their eyes during the Mob meeting, they are able to recruit a player to join the mob. The Capo will choose a player during the Mob meeting. That player will be converted when the game begins.'
    ]
  },
  {
    id: 'mob-boss',
    name: 'Mob boss',
    team: 'mob',
    description: 'The Mob Boss has the “Resist Temptation” trait. The Mob Boss Attends the Mob Meeting. They are a member of the Mob.',
    traits: [
      'Resist Temptation - Cannot be affected by any abilities. '
    ]
  },
  {
    id: 'crooked-cop',
    name: 'Crooked Cop',
    team: 'mob',
    description: 'The Crooked Cop attends the Mob Meeting. The Crooked Cop has the “Flash Badge” ability. They are on the side of the Mob. Member of the Law.',
    abilities: [
      'Flash Badge - You take your phone and flash your Badge screen at a player. Overcome with the power of the law, that player will reveal their role to you by showing their screen. The affected player CANNOT do any actions or fire their weapon before showing their screen. However, you can be killed by ANOTHER player during the exchange. The Crooked Cop CAN shoot the other player while they are showing their role.'
    ]
  },
  {
    id: 'gunsmith',
    name: 'Gunsmith',
    team: 'city',
    description: 'The Gunsmith is on the side of the City.',
    abilities: [
      'Weapon Jam - The Gunsmith can choose a player in the app to jam their weapon. That player CANNOT shoot their weapon until their timer is up.'
    ]
  },
  {
    id: 'thief',
    name: 'Thief',
    team: 'city',
    description: 'The Thief has the “Pickpocket” ability. They start on the side of the City, but if they Pickpocket a member of the “Law” they become a member of the Mob.',
    abilities: [
      'Pickpocket - Select a player in the app to steal some information from. A piece of random information will be sent to the Thief. A Thief can find out if a player has an Ability, a Trait, if they are on the side of the City, or a Mob Member. If the Thief tries to Pickpocket a member of the “Law” they will be on the run. The Thief now becomes a member of the Mob without being informed who other members are. All members of the “Law” are informed who the Thief is.'
    ]
  },
  {
    id: 'medic',
    name: 'Medic',
    team: 'city',
    description: 'The Medic has the “Resuscitate” Ability. They are on the side of the City.',
    abilities: [
      'Resuscitate - The Medic is able to bring a player back from death by resuscitating them. The Medic must approach the body, lay a hand on them and announce “CLEAR!”. The dead player is now alive once more.'
    ]
  },
  {
    id: 'mole',
    name: 'Mole',
    team: 'mob',
    description: 'The Mole DOES NOT attend the Mob Meeting. The Mole will be notified who the other Mob members are at a random interval into the game. They are a member of the Mob.'
  },
  {
    id: 'psychic',
    name: 'Psychic',
    team: 'city',
    description: 'The Psychic has the “Palm Read” ability. They are on the side of the City.',
    abilities: [
      'Palm Read - Select 2 players on the app on read their palms. The Psychic will be shown 2 roles but the roles will not be assigned to any player.'
    ]
  },
  {
    id: 'medium',
    name: 'Medium',
    team: 'city',
    description: 'The Medium has the “Talk to the dead” ability. They are on the side of the City.',
    abilities: [
      'Talk to the Dead - Approach a dead body and ask them their role and if they know who killed them. The player must answer unless they have the “Resist Temptation” trait.'
    ]
  },
  {
    id: 'Informant',
    name: 'Informant',
    team: 'city',
    description: 'The informant has the passive trait of “Rumor”. The Informant is on the side of the City.',
    traits: [
      'Rumor - During a random interval, the Informant will be given a player’s name and a role associated with that player. However, there is no way of knowing if the information is accurate.'
    ]
  },
  {
    id: 'priest',
    name: 'Priest',
    team: 'city',
    description: 'The Priest has the “Resist Temptation” Trait. They are on the Side of the City.',
    traits: [
      'Resist Temptation - Cannot be affected by any abilities.'
    ]
  },
  {
    id: 'wizard',
    name: 'Wizard',
    team: 'city',
    description: 'The wizard has the “Spell” Ability. They are on the side of the City.',
    abilities: [
      'Spell - Select a player in the app and cast a random spell onto them. They player will be notified of the spell and its effects.'
    ]
  },
  {
    id: 'martyr',
    name: 'Martyr',
    team: 'neutral',
    description: 'The Martyr wants to die for their cause and wins the game if killed. The Martyr cannot kill. They are not a part of any team other than their own cause.',
    specialWinCondition: 'If the martyr dies, they win.'
  }
  // zombie, necro, and hitman
];

export default Roles;
