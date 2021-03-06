/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-var-requires */
import React, { FC, useEffect, useMemo, useState } from 'react';
import { Text, Box } from 'ink';
import { AI, HighAndLowGame, Turn } from './models';
import SelectInput from 'ink-select-input';
const Gradient: FC<{ name: string }> = require('ink-gradient');
const BigText: FC<{ text: string; font?: string }> = require('ink-big-text');
import { Club, Diamond, FrenchSuitedCard, Heart, Spade } from '@kamiazya-online-casino/french-suited-deck';

const Card: FC<{ card: FrenchSuitedCard | null }> = ({ card }) => {
  const text = useMemo(() => {
    if (card) {
      if (card.is(Spade)) {
        return '♠' + card.rank;
      } else if (card.is(Diamond)) {
        return '♦' + card.rank;
      } else if (card.is(Heart)) {
        return '♡' + card.rank;
      } else if (card.is(Club)) {
        return '♧' + card.rank;
      }
    }
    return '?';
  }, [card]);
  return <Text color={card?.isRed ? 'red' : undefined}>{text}</Text>;
};

const Title: FC = () => {
  return (
    <Box>
      <Gradient name="passion">
        <BigText text="High and Low" font="simple" />
      </Gradient>
    </Box>
  );
};
const ScoreBoard: FC<{ player: 1 | 2; scores: { 1: number; 2: number } }> = ({ player, scores }) => {
  return (
    <Box justifyContent="space-around" borderStyle="single" flexDirection="column" width="30%">
      <Box justifyContent="center">
        <Text bold>Score</Text>
      </Box>
      <Box justifyContent="space-around" flexDirection="row">
        <Box>
          <Text color="green" inverse={player === 1}>
            You
          </Text>
        </Box>
        <Box>
          <Text color={'red'} inverse={player === 2}>
            AI
          </Text>
        </Box>
      </Box>
      <Box justifyContent="space-around" flexDirection="row">
        <Box>
          <Text color="green">{scores[1]}</Text>
        </Box>
        <Box>
          <Text color={'red'}>{scores[2]}</Text>
        </Box>
      </Box>
    </Box>
  );
};

const WIN: FC = () => (
  <Box>
    <BigText text="WIN" font="tiny" />
  </Box>
);

const LOSE: FC = () => (
  <Box>
    <BigText text="LOSE" font="tiny" />
  </Box>
);

const Field: FC<{
  cards: [you: FrenchSuitedCard | null, ai: FrenchSuitedCard | null];
  winPlayer: 'YOU' | 'AI' | null;
}> = ({ cards, winPlayer }) => {
  return (
    <Box justifyContent="space-around" height={5}>
      {winPlayer === null ? null : winPlayer === 'YOU' ? <WIN /> : <LOSE />}
      <Box justifyContent="center">
        <Box borderStyle="bold" alignItems="center" width={8} justifyContent="space-around">
          <Box alignSelf="center">
            <Card card={cards[0]}></Card>
          </Box>
        </Box>
        <Box alignSelf="center" margin={2}>
          <Text>V.S.</Text>
        </Box>
        <Box borderStyle="bold" alignItems="center" width={8} justifyContent="space-around">
          <Box alignSelf="center">
            <Card card={cards[1]}></Card>
          </Box>
        </Box>
      </Box>
      {winPlayer === null ? null : winPlayer === 'AI' ? <WIN /> : <LOSE />}
    </Box>
  );
};

export const HighAndLow: FC = () => {
  const game = useMemo(() => new HighAndLowGame(), []);
  const ai = useMemo(() => new AI(), []);
  const [scores, setScores] = useState(game.scores);
  const [player, setPlayer] = useState<1 | 2>(1);
  const [winPlayer, setWinPlayer] = useState<'YOU' | 'AI' | null>(null);
  const [cards, setCards] = useState<[you: FrenchSuitedCard | null, ai: FrenchSuitedCard | null]>([null, null]);
  const [discard, setDiscard] = useState<FrenchSuitedCard[]>([]);
  const [turn, setTurn] = useState<Turn>();
  const items = [
    {
      label: 'High',
      value: 'high',
    },
    {
      label: 'Low',
      value: 'low',
    },
  ];
  const onAnswer = (item: any) => {
    if (player === 1) {
      setCards([turn?.child ?? null, turn?.parent ?? null]);
      const hl: 'high' | 'low' = item.value;
      if (hl === 'high') {
        setWinPlayer(turn!.child.rank > turn!.parent.rank ? 'AI' : 'YOU');
      } else {
        setWinPlayer(turn!.child.rank < turn!.parent.rank ? 'AI' : 'YOU');
      }
      setTimeout(() => {
        turn?.answer(item.value);
        setWinPlayer(null);
      }, 500);
    }
  };

  useEffect(() => {
    (async function () {
      for await (const turn of game.start()) {
        setScores(game.scores);
        setPlayer(turn.player);
        switch (turn.player) {
          case 1:
            setCards([null, turn.parent]);
            setTurn(turn);
            break;
          default:
            setCards([turn.parent, null]);
            await ai.play(turn);
            break;
        }
        setDiscard(game.discard.slice());
      }
    })();
  }, [game]);

  return (
    <Box flexDirection="column" justifyContent="space-between">
      <Box flexDirection="column" alignItems="center">
        <Title />
        <ScoreBoard player={player} scores={scores} />
        <Field cards={cards} winPlayer={winPlayer} />
        <Box>
          <SelectInput items={items} onSelect={onAnswer} />
        </Box>
        <Box justifyContent="space-around" borderStyle="classic" width="50%">
          {discard.map((card, index) => (
            <Box key={index} width={5}>
              <Card card={card}></Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
