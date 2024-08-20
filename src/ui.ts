import chalk from 'chalk'

export function log(type: 'success' | 'fail', label?: string) {
  return <T extends any[]>(...args: T) => {
    if (type === 'success') {
      console.log('\n', label ? chalk.bgGreen(` ${label} `) : '', chalk.green(...args))
    } else if (type === 'fail') {
      console.log('\n', label ? chalk.black.bgRgb(220, 50, 50)(` ${label} `) : '', chalk.red(...args))
    } else {
      throw new Error(`type "${type}" isn't allowed`)
    }
  }
}
