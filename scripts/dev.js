import { spawn } from 'node:child_process'
import waitOn from 'wait-on'

function run(cmd, args) {
  return spawn(cmd, args, {
    stdio: ['ignore', 'ignore', 'inherit'], // silencia stdout, mantém stderr
    shell: true,
  })
}

const next = run('next', ['dev'])
const storybook = run('storybook', ['dev', '-p', '6006'])

waitOn({
  resources: [
    'http://localhost:3000',
    'http://localhost:6006',
  ],
})
  .then(() => {
    console.log('')
    console.log('application: http://localhost:3000/')
    console.log('api-doc: http://localhost:3000/reference/')
    console.log('storybook: http://localhost:6006/')
    console.log('')
  })
  .catch((err) => {
    console.error('Erro ao subir ambiente de desenvolvimento')
    console.error(err.message)
    process.exit(1)
  })
