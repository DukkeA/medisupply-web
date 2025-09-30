import { classNames, cn } from '.'

describe('classNames', () => {
  it('should merge simple class strings', () => {
    expect(classNames('class1', 'class2')).toBe('class1 class2')
  })

  it('should handle empty inputs', () => {
    expect(classNames()).toBe('')
    expect(classNames('')).toBe('')
    expect(classNames(null, undefined)).toBe('')
  })

  it('should handle conditional classes', () => {
    expect(classNames('base', true && 'conditional', false && 'hidden')).toBe(
      'base conditional'
    )
  })

  it('should handle object syntax', () => {
    expect(
      classNames({
        class1: true,
        class2: false,
        class3: true
      })
    ).toBe('class1 class3')
  })

  it('should handle array syntax', () => {
    expect(classNames(['class1', 'class2'])).toBe('class1 class2')
  })

  it('should resolve Tailwind CSS conflicts - backgrounds', () => {
    expect(classNames('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  })

  it('should resolve Tailwind CSS conflicts - padding', () => {
    expect(classNames('p-4', 'px-2')).toBe('p-4 px-2')
    expect(classNames('px-4', 'px-2')).toBe('px-2')
  })

  it('should resolve Tailwind CSS conflicts - margins', () => {
    expect(classNames('m-4', 'm-8')).toBe('m-8')
    expect(classNames('mx-4', 'mx-8', 'my-2')).toBe('mx-8 my-2')
  })

  it('should handle complex combinations', () => {
    const result = classNames(
      'base-class',
      {
        'conditional-true': true,
        'conditional-false': false
      },
      ['array-class'],
      'bg-red-500',
      'bg-blue-500', // Should override red
      'p-4'
    )

    expect(result).toBe(
      'base-class conditional-true array-class bg-blue-500 p-4'
    )
  })

  it('should handle responsive and state variants', () => {
    expect(
      classNames(
        'text-sm md:text-lg',
        'hover:bg-gray-100',
        'focus:outline-none'
      )
    ).toBe('text-sm md:text-lg hover:bg-gray-100 focus:outline-none')
  })

  it('should handle conflicting responsive classes', () => {
    expect(
      classNames('text-red-500', 'md:text-red-500', 'md:text-blue-500')
    ).toBe('text-red-500 md:text-blue-500')
  })

  it('should preserve non-conflicting classes', () => {
    expect(
      classNames(
        'flex',
        'items-center',
        'justify-between',
        'bg-white',
        'shadow-lg'
      )
    ).toBe('flex items-center justify-between bg-white shadow-lg')
  })

  describe('cn alias', () => {
    it('should work identically to classNames', () => {
      const input = ['class1', { class2: true }, 'bg-red-500', 'bg-blue-500']
      expect(cn(...input)).toBe(classNames(...input))
    })

    it('should resolve conflicts like classNames', () => {
      expect(cn('p-4', 'p-8')).toBe('p-8')
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
    })
  })

  describe('edge cases', () => {
    it('should handle whitespace', () => {
      expect(classNames('  class1  ', '  class2  ')).toBe('class1 class2')
    })

    it('should handle nested arrays', () => {
      expect(classNames(['class1', ['class2', 'class3']])).toBe(
        'class1 class2 class3'
      )
    })

    it('should handle mixed types', () => {
      expect(
        classNames(
          'string-class',
          { 'object-class': true },
          ['array-class'],
          null,
          undefined,
          false,
          0,
          ''
        )
      ).toBe('string-class object-class array-class')
    })
  })
})
