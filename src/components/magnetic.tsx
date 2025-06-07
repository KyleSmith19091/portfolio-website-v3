import { CursorContext } from '@/app/providers';
import React, {
    useRef,
    cloneElement,
    isValidElement,
    ReactElement,
    PropsWithChildren,
    useContext,
    MouseEventHandler,
    Ref,
} from 'react';

type MagneticProps = PropsWithChildren<{}>;

const Magnetic = ({ children }: MagneticProps) => {
    const { setCursorVariant, setHoveredElement, clearHoveredElement } = useContext(CursorContext);
    const innerRef = useRef<HTMLElement | null>(null);
    const onMouseEnter = () => {
        if (innerRef.current && innerRef.current.style.backgroundColor !== "") {
          setCursorVariant("darkBg");
        } else {
          setCursorVariant("pointer");
        }
        if (innerRef.current) {
            setHoveredElement(innerRef.current);
        }
    };
    const onMouseLeave = () => {
        setCursorVariant("default")
        clearHoveredElement()
    };

    if (isValidElement(children)) {
        type WithRefAndMouseHandlers = {
          ref?: Ref<HTMLElement>;
          onMouseEnter?: MouseEventHandler<HTMLElement>;
          onMouseLeave?: MouseEventHandler<HTMLElement>;
        };
      
        const typedChild = children as ReactElement<WithRefAndMouseHandlers>;
        const childProps = typedChild.props;

        return cloneElement(typedChild, {
          ref: innerRef,
          onMouseEnter: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
            childProps.onMouseEnter?.(event);
            onMouseEnter();
          },
          onMouseLeave: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
            childProps.onMouseLeave?.(event);
            onMouseLeave();
          },
        });
      }

    return null;
};

export default Magnetic;