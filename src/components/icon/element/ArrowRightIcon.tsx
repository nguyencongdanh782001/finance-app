import { SvgProps, defaultProps } from "./_constant";

const ArrowRightIcon: React.FC<SvgProps> = (props) => {
  return (
    <svg {...defaultProps} {...props} viewBox="0 0 15 14">
      <path d="M7.36 7L4.67667 4.31667L5.49333 3.5L8.99333 7L5.49333 10.5L4.67667 9.68333L7.36 7Z" />
    </svg>
  );
};

export default ArrowRightIcon;
