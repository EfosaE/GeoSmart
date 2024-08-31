import { RiMenu2Fill } from 'react-icons/ri';

const Header = () => {
  return (
    <header className='py-4'>
      <div className='container flex justify-between items-center'>
        <h3 className='font-mono  '>
          Geo<span className='text-indigo-700'>Smart</span>
        </h3>
        <RiMenu2Fill />
      </div>
    </header>
  );
};

export default Header;
