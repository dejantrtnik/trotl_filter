import React from 'react';

const LineDivider = ({
  text = '',
  position = 'center', // 'left', 'center', 'right'
  color = '#ccc',
  thickness = 1,
  margin = '20px 0',
  fontSize = 14,
}) => {
  const getLayout = () => {
    switch (position) {
      case 'left':
        return { leftFlex: 0, rightFlex: 1, justify: 'flex-start' };
      case 'right':
        return { leftFlex: 1, rightFlex: 0, justify: 'flex-end' };
      default:
        return { leftFlex: 1, rightFlex: 1, justify: 'center' };
    }
  };

  const { leftFlex, rightFlex, justify } = getLayout();

  return (
    <div style={{ margin }}>
      {text ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: justify,
            gap: 12,
          }}
        >
          <div style={{ flex: leftFlex, height: thickness, backgroundColor: color }} />
          <span
            style={{
              whiteSpace: 'nowrap',
              fontSize,
              color: '#333',
            }}
          >
            {text}
          </span>
          <div style={{ flex: rightFlex, height: thickness, backgroundColor: color }} />
        </div>
      ) : (
        // Full-width line when no text
        <div style={{ height: thickness, backgroundColor: color, width: '100%' }} />
      )}
    </div>
  );
};

export default LineDivider;
