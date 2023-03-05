import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import api from 'instance'
import { Container, Grid, GridItem, Spinner } from '@chakra-ui/react'
import Profile from 'components/profile'
import Address from 'components/profile/address'
import Orders from 'components/profile/orders'

const ProfilePage = () => {
	const router = useRouter()
	const { id } = router.query
	const { data: user, isFetched: isUserFetched } = useQuery(['user', id], () => api.get('/users', id))
	const { data: orders, isFetched: isOrdersFetched } = useQuery(['orders'], () => api.all('/orders'))

	if (!isUserFetched || !isOrdersFetched) {
		return (
			<Container>
				<Spinner color="brand.default" />
			</Container>
		)
	}

	return (
		<Container>
			<Grid templateColumns={{ base: '1fr', lg: '1fr 384px' }} alignItems="start" gap={6}>
				<GridItem display="grid" gap={6}>
					<Orders user={user} orders={orders} />
				</GridItem>

				<GridItem display="grid" gap={6}>
					<Profile user={user} />
					<Address user={user} />
				</GridItem>
			</Grid>
		</Container>
	)
}

export default ProfilePage
