const React = require('react');

const Image = React.forwardRef(function Image(props, ref) {
  return React.createElement('Image', { ...props, ref });
});

Image.displayName = 'Image';

module.exports = { Image };
