"use client";

import { useRef, type MouseEventHandler } from "react";

/**
 * Безопасное закрытие модалки по клику на бэкдроп.
 *
 * Проблема: если mousedown произошёл внутри диалога (например, пользователь
 * выделяет текст в поле и выносит курсор за пределы попапа), а mouseup —
 * на бэкдропе, браузер генерирует click на бэкдропе (общем предке целей),
 * и модалка закрывается вопреки ожиданиям пользователя.
 *
 * Решение: закрываем только если нажатие началось на самом бэкдропе.
 *
 * Возвращает пропсы для корневого (backdrop) элемента модалки.
 */
export function useBackdropClose(onClose: () => void) {
  const mouseDownOnBackdropRef = useRef(false);

  const onMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    mouseDownOnBackdropRef.current = event.target === event.currentTarget;
  };

  const onClick: MouseEventHandler<HTMLDivElement> = (event) => {
    if (event.target === event.currentTarget && mouseDownOnBackdropRef.current) {
      onClose();
    }
  };

  return { onMouseDown, onClick };
}
