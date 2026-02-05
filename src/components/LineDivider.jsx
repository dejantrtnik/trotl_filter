import React from 'react';

const LineDivider = ({
  text = '',
  position = 'center', // 'left', 'center', 'right'
  color = '#ccc',
  thickness = 1,
  margin = '20px 0',
  fontSize = 14,
  fontWeight = 'normal',
  fontColor = '#333',
  style = {},
}) => {
  const getLayout = () => {
    switch (position) {
      case 'left':
        return { leftFlex: 0, rightFlex: 1, justify: 'flex-start', gap: 12 };
      case 'right':
        return { leftFlex: 1, rightFlex: 0, justify: 'flex-end', gap: 12 };
      default:
        return { leftFlex: 1, rightFlex: 1, justify: 'center', gap: 12 };
    }
  };

  const { leftFlex, rightFlex, justify, gap } = getLayout();

  return (
    <div style={{ margin, ...style }}>
      {text ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: justify,
            gap: gap,
          }}
        >
          {leftFlex > 0 && <div style={{ flex: leftFlex, height: thickness, backgroundColor: color }} />}
          <span
            style={{
              whiteSpace: 'nowrap',
              fontSize,
              color: fontColor,
              fontWeight,
            }}
          >
            {text}
          </span>
          {rightFlex > 0 && <div style={{ flex: rightFlex, height: thickness, backgroundColor: color }} />}
        </div>
      ) : (
        // Full-width line when no text
        <div style={{ height: thickness, backgroundColor: color, width: '100%' }} />
      )}
    </div>
  );
};

export default LineDivider;
