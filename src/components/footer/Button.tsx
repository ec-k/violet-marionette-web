import React from 'react'
import styled from 'styled-components'

type shapeType = 'round' | 'square' | 'rect'

interface ButtonProps {
  style: {
    height: number
    shape: shapeType
    isActive: boolean
    left: number
    // top: number
  }
  icon: any
  onClick: () => void
}

export const Button: React.FC<ButtonProps> = (props) => {
  // const width = (props.style.shape === 'rect') ? props.style.height * 1.25 : props.style.height
  const width = props.style.height
  const RectButton = styled.button`
    position: relative;
    border: none;
    background-color: #71526d;
    color: #ffffff;
    height: ${(props) => props.style?.height} px;
    width: ${width} px;
    left: ${(props) => props.style?.left}%;
    bottom: 0px;
    align-items: center;
    justify-content: center;
    display: inline-block;
  `
  const CircleButton = styled(RectButton)`
    border-radius: 50%;
  `

  const buttonStyleList = {
    default: RectButton,
    square: RectButton,
    rect: RectButton,
    round: CircleButton,
  }

  const Component =
    buttonStyleList[props.style.shape] || buttonStyleList.default

  // if (!props.style.backgroundColor) props.style.backgroundColor = React.useContext(props.theme.colors.violet)

  return (
    <Component type="button" style={props.style} onClick={props.onClick}>
      {props.icon}
    </Component>
  )
}
