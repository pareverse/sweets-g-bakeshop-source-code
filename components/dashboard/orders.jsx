import Router from 'next/router'
import { useQuery } from '@tanstack/react-query'
import api from 'instance'
import { Badge, Flex, IconButton, Select, Td, Text, Tr } from '@chakra-ui/react'
import { FiMoreHorizontal } from 'react-icons/fi'
import Card from 'components/_card'
import Table from 'components/_table'
import { month } from 'functions/month'

const Orders = () => {
	const { data: orders, isFetched: isOrdersFetched } = useQuery(['orders_dashboard'], () => api.all('/orders'))

	return (
		<Card>
			<Flex justify="space-between" align="center" gap={6} mb={6}>
				<Text fontSize="xl" fontWeight="semibold" color="accent-1">
					Recent Orders
				</Text>

				<IconButton size="xs" icon={<FiMoreHorizontal size={12} />} onClick={() => Router.push('/admin/orders')} />
			</Flex>

			<Table
				data={orders}
				fetched={isOrdersFetched}
				th={['Order ID', 'Customer', 'Product', 'Total', 'Payment Method', 'Status', 'Created', '']}
				td={(order) => (
					<Tr key={order._id}>
						<Td>
							<Text fontWeight="semibold">#{order._id.toUpperCase().slice(15, 25)}</Text>
						</Td>

						<Td>
							<Text textTransform="capitalize">{order.user.name}</Text>
						</Td>

						<Td>
							<Text>x{order.items.length}</Text>
						</Td>

						<Td>
							<Text>₱{order.total.toFixed(2)}</Text>
						</Td>

						<Td>
							<Badge variant="tinted" colorScheme="brand">
								{order.method}
							</Badge>
						</Td>

						<Td>
							<Badge variant="tinted" colorScheme={order.status === 'Cancelled' ? 'red' : 'brand'}>
								{order.status === 'To Pay' ? 'Pending' : order.status === 'To Ship' ? 'To Pick Up' : order.status === 'To Receive' ? 'To Deliver' : order.status === 'Completed' ? 'Completed' : order.status === 'Cancelled' && 'Cancelled'}
							</Badge>
						</Td>

						<Td>
							<Text>{month[order.created.split(',')[0].split('/')[0] - 1] + ' ' + order.created.split(',')[0].split('/')[1] + ', ' + order.created.split(',')[0].split('/')[2]}</Text>
						</Td>

						<Td>
							<Flex justify="right">
								<IconButton size="xs" icon={<FiMoreHorizontal size={12} />} onClick={() => Router.push(`/admin/orders/${order._id}`)} />
							</Flex>
						</Td>
					</Tr>
				)}
				settings={{
					search: 'off',
					show: [5]
				}}
			/>
		</Card>
	)
}

export default Orders
