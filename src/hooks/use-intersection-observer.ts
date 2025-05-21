import {useEffect, useRef, useState} from 'react'

// 判断一个DOM元素是否出现在视口中
// options 是传入 IntersectionObserver 的初始化配置
export const useIntersectionObserver = (options?: IntersectionObserverInit) => {
  const [isIntersecting, setIsIntersecting] = useState(false) // 是否出现在视口中
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // [entry] 是个解构，我们这里只观察一个元素
    // IntersectionObserver 回调函数默认会传一个数组（所有观察到的元素）
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    // 如果ref对应的元素存在，就让observer开始观察
    if(targetRef.current) {
      observer.observe(targetRef.current)
    }

    // 清除监听
    return () => observer.disconnect()
  }, [options])

  return {targetRef, isIntersecting}
}