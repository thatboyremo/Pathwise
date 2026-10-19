import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reset-password/$uid/$token')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/reset-password/$uid/$token"!</div>
}
