import { Notification03Icon } from '@hugeicons/core-free-icons'
import { Icon } from './icon'

export function SideBar() {
  return (
    <div className='h-full z-20 bg-surface-1 border-r border-subtle transition-all duration-300 ease-in-out translate-x-0 opacity-100 w-62.5 max-w-62.5 group overflow-hidden relative flex flex-col pt-3 px-5 animate-fade-in'>
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between gap-2 px-2'>
          <span className="text-16 text-primary font-medium pt-1">
            Projects
          </span>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center justify-center gap-1 aspect-square whitespace-nowrap transition-colors focus-visible:outline-none disabled:pointer-events-none bg-layer-transparent hover:bg-layer-transparent-hover active:bg-layer-transparent-active focus-visible:bg-layer-transparent-active disabled:bg-layer-transparent text-secondary disabled:text-disabled size-6 rounded-md">
              <Icon icon={Notification03Icon} />
            </button>
          </div>
        </div>
      </div>
      <div>
        home
      </div>
      <div>
        Business
      </div>
    </div>
  )
}
