import { useRef, useState } from 'react';
import Dialog from './Dialog';

const Header = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
  };
  return (
    <header className='py-4'>
      <div className='container flex justify-between items-center'>
        <h3 className='font-mono  '>
          Geo<span className='text-indigo-700'>Smart</span>
        </h3>
        <button className='text-indigo-400 font-light' onClick={openModal}>
          Help
        </button>
      </div>
      <Dialog ref={modalRef} closeModal={closeModal} isOpen={isOpen} />
    </header>
  );
};

export default Header;
