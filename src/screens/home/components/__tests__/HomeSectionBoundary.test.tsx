import React from 'react';
import { Text } from 'react-native';
import renderer from 'react-test-renderer';
import { HomeSectionBoundary } from '../HomeSectionBoundary';

describe('HomeSectionBoundary', () => {
  it('renders children when no error', () => {
    const tree = renderer.create(
      <HomeSectionBoundary sectionName="Test">
        <Text>Healthy content</Text>
      </HomeSectionBoundary>,
    );
    expect(tree.toJSON()).toMatchSnapshot();
    expect(tree.root.findByType(Text).props.children).toBe('Healthy content');
  });
});
