const generateName = (): string => {
    const firstname: string[] = [
        'Sneaky', 'Mighty', 'Smol', 'Turbo', 'Captain'
    ]

    const lastname: string[] = [
        'Pancake', 'Noodle', 'Turtle', 'Shadow', 'Rodent'
    ]

    const findex = Math.floor(Math.random() * firstname.length)
    const lindex = Math.floor(Math.random() * lastname.length)

    return `${firstname[findex]} ${lastname[lindex]}`
    
}

