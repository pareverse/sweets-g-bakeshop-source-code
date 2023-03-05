import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import api from 'instance'
import { Avatar, Button, chakra, Divider, Flex, FormControl, FormErrorMessage, FormLabel, IconButton, Input, Select, Text, useDisclosure, useToast } from '@chakra-ui/react'
import { FiChevronRight } from 'react-icons/fi'
import Card from 'components/_card'
import Modal from 'components/_modal'
import Toast from 'components/_toast'

const EditModal = ({ user }) => {
	const disclosure = useDisclosure()
	const { data: session } = useSession()
	const queryClient = useQueryClient()
	const cities = new Array('Las Piñas', 'Makati', 'Mandaluyong', 'Manila', 'Marikina', 'Muntinlupa', 'Navotas', 'Parañaque', 'Pasay', 'Pasig', 'Quezon', 'San Juan', 'Taguig', 'Valenzuela')

	const {
		register,
		formState: { errors },
		clearErrors,
		reset,
		handleSubmit
	} = useForm()

	const [isLoading, setIsLoading] = useState(false)
	const toast = useToast()

	const editMutation = useMutation((data) => api.update('/users', user._id, data), {
		onSuccess: () => {
			queryClient.invalidateQueries('users')
			setIsLoading(false)
			disclosure.onClose()

			toast({
				position: 'top',
				duration: 1000,
				render: () => <Toast title="Success" description="Profile updated successfully." />
			})
		}
	})

	const onSubmit = (data) => {
		setIsLoading(true)

		if (session.user.role === 'Admin') {
			editMutation.mutate({
				name: data.name,
				contact: data.contact,
				gender: data.gender,
				address: {
					region: data.region,
					city: data.city,
					barangay: data.barangay,
					streets: data.streets,
					postal: data.postal
				},
				role: data.role,
				status: data.status
			})
		} else {
			editMutation.mutate({
				name: data.name,
				contact: data.contact,
				gender: data.gender,
				address: {
					region: data.region,
					city: data.city,
					barangay: data.barangay,
					streets: data.streets,
					postal: data.postal
				}
			})
		}
	}

	return (
		<Modal
			title="Profile Information"
			size="xl"
			toggle={(onOpen) => (
				<Button
					variant="tinted"
					size="lg"
					colorScheme="brand"
					rightIcon={<FiChevronRight size={16} />}
					onClick={() => {
						clearErrors()
						reset()
						onOpen()
					}}
				>
					Edit Details
				</Button>
			)}
			disclosure={disclosure}
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Flex direction="column" gap={6}>
					<FormControl>
						<FormLabel>Identification</FormLabel>
						<Input value={user._id.toUpperCase()} size="lg" cursor="default" readOnly />
					</FormControl>

					<FormControl isInvalid={errors.name}>
						<FormLabel>Full Name</FormLabel>
						<Input defaultValue={user.name} size="lg" {...register('name', { required: true })} />
						<FormErrorMessage>This field is required.</FormErrorMessage>
					</FormControl>

					<FormControl>
						<FormLabel>Email Address</FormLabel>
						<Input value={user.email} size="lg" cursor="default" readOnly />
					</FormControl>

					<FormControl isInvalid={errors.contact}>
						<FormLabel>Contact</FormLabel>
						<Input type="number" defaultValue={user.contact} size="lg" {...register('contact', { required: true })} />
						<FormErrorMessage>This field is required.</FormErrorMessage>
					</FormControl>

					<FormControl isInvalid={errors.gender}>
						<FormLabel>Gender</FormLabel>

						<Select placeholder="Select" defaultValue={user.gender} size="lg" {...register('gender', { required: true })}>
							<chakra.option value="Male">Male</chakra.option>
							<chakra.option value="Female">Female</chakra.option>
						</Select>

						<FormErrorMessage>This field is required.</FormErrorMessage>
					</FormControl>

					{session.user.role === 'Admin' && (
						<>
							<FormControl>
								<FormLabel>Role</FormLabel>

								<Select defaultValue={user.role} size="lg" {...register('role')}>
									<chakra.option value="Admin">Admin</chakra.option>
									<chakra.option value="Customer">Customer</chakra.option>
								</Select>
							</FormControl>

							<FormControl>
								<FormLabel>Status</FormLabel>

								<Select defaultValue={user.status} size="lg" {...register('status')}>
									<chakra.option value="Active">Active</chakra.option>
									<chakra.option value="Inactive">Inactive</chakra.option>
								</Select>
							</FormControl>
						</>
					)}

					<Flex direction="column" gap={6} mx={-6}>
						<Divider />

						<Flex justify="end" align="center" gap={3} px={6}>
							<Button size="lg" onClick={disclosure.onClose}>
								Close
							</Button>

							<Button type="submit" size="lg" colorScheme="brand" isLoading={isLoading}>
								Save Changes
							</Button>
						</Flex>
					</Flex>
				</Flex>
			</form>
		</Modal>
	)
}

const Profile = ({ user }) => {
	return (
		<Card>
			<Flex justify="center" align="center" direction="column" gap={3}>
				<Avatar size="xl" name={user.name} src={user.image} />

				<Flex align="center" direction="column" textAlign="center">
					<Text fontSize="sm" fontWeight="medium" lineHeight={5} color="accent-1" noOfLines={1}>
						{user.name}
					</Text>

					<Text fontSize="sm" lineHeight={5} w={164} noOfLines={1}>
						{user.email}
					</Text>
				</Flex>

				<EditModal user={user} />
			</Flex>
		</Card>
	)
}

export default Profile
