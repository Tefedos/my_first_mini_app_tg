import "dotenv/config";
import { Client } from "pg";

const HERO_LIST_URL =
  "https://www.dota2.com/datafeed/herolist?language=english";

const avatars = Array.from({ length: 7 }, (_, index) => ({
  id: index + 1,
  avatarsUrl: `/avatars/avatar-${index + 1}.png`,
}));

const positions = [
  { id: 1, pos: "Легкая" },
  { id: 2, pos: "Мид" },
  { id: 3, pos: "Сложная" },
  { id: 4, pos: "Поддержка" },
  { id: 5, pos: "Полная поддержка" },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const heroes = await fetchDotaHeroes();

    await client.query("begin");

    for (const avatar of avatars) {
      await client.query(
        `
          insert into avatars (id, avatars_url)
          values ($1, $2)
          on conflict (id) do update set avatars_url = excluded.avatars_url
        `,
        [avatar.id, avatar.avatarsUrl],
      );
    }

    for (const position of positions) {
      await client.query(
        `
          insert into postion (id, pos)
          values ($1, $2)
          on conflict (id) do update set pos = excluded.pos
        `,
        [position.id, position.pos],
      );
    }

    for (const hero of heroes) {
      await client.query(
        `
          insert into heroes (id, hero_name)
          values ($1, $2)
          on conflict (id) do update set hero_name = excluded.hero_name
        `,
        [hero.id, hero.heroName],
      );
    }

    await client.query("commit");

    console.log(
      `Seeded ${avatars.length} avatars, ${positions.length} positions and ${heroes.length} Dota 2 heroes.`,
    );
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

async function fetchDotaHeroes() {
  const response = await fetch(HERO_LIST_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch Dota 2 heroes: ${response.status}`);
  }

  const payload = await response.json();
  const heroes = payload?.result?.data?.heroes;

  if (!Array.isArray(heroes)) {
    throw new Error("Dota 2 hero response has an unexpected shape");
  }

  return heroes
    .map((hero) => ({
      id: Number(hero.id),
      heroName: hero.name_english_loc || hero.name_loc,
    }))
    .filter((hero) => Number.isInteger(hero.id) && hero.heroName)
    .sort((left, right) => left.id - right.id);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
