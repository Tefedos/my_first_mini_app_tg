export const userProfileSelect = {
  avatar: {
    select: {
      avatarsUrl: true,
      id: true,
    },
  },
  avatarId: true,
  coins: true,
  id: true,
  loveHero: {
    select: {
      heroName: true,
      id: true,
    },
  },
  loveHeroId: true,
  lovePos: {
    select: {
      id: true,
      pos: true,
    },
  },
  lovePosId: true,
  name: true,
} as const;
