const Button = ({icon, action}) => {
  return (
    <>
    <span onClick={action}>
      {icon}
    </span>
    </>
  )
}

export default Button;
