import { forwardRef } from 'react';

interface ModalProps {
  closeModal: () => void;
  isOpen: boolean;
}
const Dialog = forwardRef<HTMLDivElement, ModalProps>(
  ({ closeModal, isOpen }, ref) => {
    return (
      <div
        className={`items-center justify-center h-screen absolute inset-0 z-50 w-full  ${
          isOpen ? 'flex' : 'hidden'
        }`}
        ref={ref}>
        <div className={`h-screen rounded-lg p-6 bg-white shadow-lg w-full`}>
          <div className='flex flex-col items-center justify-center '>
            <h2 className='text-blue-400 mb-4 text-md '>How to play!</h2>
            <div className='flex flex-col gap-4 font-light'>
              <p>
                There are two modes in this game:{' '}
                <span className='text-indigo-600'>
                  Single Player and Multi Player
                </span>{' '}
                <span className='italic text-sm'>
                  (for now, only 2 players are supported).
                </span>
              </p>
              <p>
                Basically, It is a game of flags,{' '}
                <span className='italic text-sm'>
                  (capitals coming soon...).
                </span>{' '}
                where in a country's flag is displayed and you are to choose the
                right option.
              </p>
              <p>
                There is a timer in both modes. For now, the feature to set it
                yourself may not have been implemented{' '}
                <span className='italic text-sm'>
                  (too lazy to add that but I may if people request for
                  it &#128522;).
                </span>
                <span className='text-indigo-500 font-semibold'>
                  ...10 secs
                </span>
              </p>
              <p>
                The main crux is the{' '}
                <span className='text-indigo-600'>Multi Player</span> mode.{' '}
                <br />
                Create a game, A roomID is generated for that game. Join the
                game using that roomID and send the roomID to the other player
                to join. <br /> <br />
                <span className='text-indigo-600 italic text-sm font-semibold'>
                  Note: to avoid the creation of unused rooms, you can't create
                  a room and join another room. so, if you are creating,{' '}
                  <span className='text-red-500 uppercase not-italic'>
                    join the room you created!
                  </span>{' '}
                  and if you are joining a room,{' '}
                  <span className='text-red-500 not-italic'>
                    DON'T CREATE ANOTHER ROOM!
                  </span>
                </span>{' '}
              </p>
              <p>
                Notice any bug or have a relevant addition to this project
                message me on{' '}
                <a href='http://' className='text-indigo-500'>
                  twitter
                </a>{' '}
                or{' '}
                <a
                  href='mailto:osamwonyiefosa02@gmail.com'
                  className='text-indigo-500'>
                  mail.
                </a>
                        </p>
                        <p className='font-bold text-blue-500 uppercase'>thank you.</p>
            </div>

            <button
              className='px-4 py-2 text-red-700 rounded hover:opacity-75 mt-4'
              onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default Dialog;
