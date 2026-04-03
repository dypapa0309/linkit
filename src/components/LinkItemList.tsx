import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface LinkItem {
  id: string;
  title: string;
  description?: string;
  link: string;
}

interface LinkItemListProps {
  items: LinkItem[];
  onItemPress: (link: string) => void;
}

export default function LinkItemList({ items, onItemPress }: LinkItemListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {items.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.item}
          onPress={() => onItemPress(item.link)}
        >
          <Text style={styles.title}>{item.title}</Text>
          {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  item: {
    backgroundColor: '#1F1408',
    borderRadius: 14,
    minHeight: 54,
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: '#D7C8B5',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
