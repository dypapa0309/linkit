import React from 'react';
import { View, StyleSheet } from 'react-native';
import ServiceCardItem from './ServiceCardItem';

interface ServiceCard {
  id: string;
  title: string;
  description: string;
  link: string;
}

interface ServiceCardListProps {
  cards: ServiceCard[];
  onCardPress: (link: string) => void;
}

export default function ServiceCardList({ cards, onCardPress }: ServiceCardListProps) {
  return (
    <View style={styles.container}>
      {cards.map(card => (
        <ServiceCardItem
          key={card.id}
          title={card.title}
          description={card.description}
          onPress={() => onCardPress(card.link)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});