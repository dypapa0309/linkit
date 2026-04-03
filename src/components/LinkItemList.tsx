import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface LinkItem {
  id: string;
  title: string;
  link: string;
}

interface LinkItemListProps {
  items: LinkItem[];
  onItemPress: (link: string) => void;
}

export default function LinkItemList({ items, onItemPress }: LinkItemListProps) {
  return (
    <View style={styles.container}>
      {items.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.item}
          onPress={() => onItemPress(item.link)}
        >
          <Text>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  item: {
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
});