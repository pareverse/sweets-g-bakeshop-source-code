import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import api from 'instance'
import { Button, chakra, Divider, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, Icon, Input, InputGroup, InputLeftElement, InputRightElement, Select, Text, useToast } from '@chakra-ui/react'
import Card from 'components/_card'
import Toast from 'components/_toast'
import { FiUser, FiX } from 'react-icons/fi'

const Controls = ({ user, carts, subtotal, discount, total }) => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const [image, setImage] = useState(null)
	const [isLoading, setIsLoading] = useState(false)
	const toast = useToast()

	const {
		register,
		watch,
		setValue,
		formState: { errors },
		handleSubmit
	} = useForm()

	const handleImage = (e) => {
		const file = e.target.files[0]

		if (!file) {
			toast({
				position: 'top',
				duration: 3000,
				render: () => <Toast status="error" title="Error" description="The file does not exist." />
			})

			return
		}

		if (file.size > 1024 * 1024) {
			toast({
				position: 'top',
				duration: 3000,
				render: () => <Toast status="error" title="Error" description="Largest image size is 1mb." />
			})

			return
		}

		if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
			toast({
				position: 'top',
				duration: 3000,
				render: () => <Toast status="error" title="Error" description="The image format is incorrect." />
			})

			return
		}

		setImage(file)
	}

	const addMutation = useMutation((data) => api.create('/orders', data), {
		onSuccess: () => {
			queryClient.invalidateQueries('orders')
			setIsLoading(false)
			router.push('/profile')

			toast({
				position: 'top',
				duration: 1000,
				render: () => <Toast title="Success" description="Order placed successfully." />
			})
		}
	})

	const onSubmit = async (data) => {
		if (!user.contact && !user.address.region && !user.address.city && !user.address.barangay && !user.address.streets && !user.address.postal) {
			toast({
				position: 'top',
				duration: 1000,
				render: () => <Toast title="Error" description="Please complete your profile information." status="error" />
			})

			router.push('/profile')

			return
		}

		if (total(carts) === 0) {
			toast({
				position: 'top',
				duration: 1000,
				render: () => <Toast title="Error" description="Shopping cart is empty." status="error" />
			})

			return
		}

		if (data.method === 'Cash on Delivery') {
			setIsLoading(true)

			addMutation.mutate({
				user: user._id,
				items: carts,
				subtotal: subtotal(carts),
				discount: discount(carts),
				total: total(carts),
				method: data.method
			})
		} else {
			if (!image) {
				setIsLoading(false)

				toast({
					position: 'top',
					duration: 3000,
					render: () => <Toast status="error" title="Error" description="Please attach proof of payment." />
				})

				return
			}

			let res = null
			setIsLoading(true)

			for (const item of [image]) {
				const formData = new FormData()

				formData.append('file', item)
				formData.append('upload_preset', 'servers')

				res = await axios.post('https://api.cloudinary.com/v1_1/commence/image/upload', formData)
			}

			addMutation.mutate({
				user: user._id,
				items: carts,
				subtotal: subtotal(carts),
				discount: discount(carts),
				total: total(carts),
				method: data.method,
				proof: res.data.secure_url
			})
		}
	}

	useEffect(() => {
		setValue('method', 'GCash')
	}, [])

	return (
		<Card>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Flex direction="column" gap={3}>
					<Text fontSize={18} fontWeight="semibold" color="accent-1">
						Payment Method
					</Text>

					<FormControl isInvalid={errors.method}>
						<Select size="lg" {...register('method', { required: true })}>
							<chakra.option value="GCash">GCash</chakra.option>
						</Select>

						<FormErrorMessage>This field is required.</FormErrorMessage>
						<FormHelperText>Note: 60% Downpayment (non-refundable)</FormHelperText>
					</FormControl>

					<FormControl>
						<FormLabel>Account Name</FormLabel>

						<InputGroup>
							<InputLeftElement pt={1} pl={1}>
								<FiUser size={16} />
							</InputLeftElement>

							<Input value="Sweet G Bakeshop" size="lg" readOnly />
						</InputGroup>
					</FormControl>
					<FormControl>
						<FormLabel>Account Number</FormLabel>

						<InputGroup>
							<InputLeftElement pt={1} pl={1}>
								#
							</InputLeftElement>

							<Input value="09123456789" size="lg" readOnly />
						</InputGroup>
					</FormControl>

					{image ? (
						<FormControl>
							<FormLabel>Proof of Payment</FormLabel>

							<InputGroup>
								<Input value={image.name} size="lg" cursor="default" readOnly />

								<InputRightElement pt={1} pr={1}>
									<Icon as={FiX} boxSize={4} color="accent-1" cursor="pointer" onClick={() => setImage(null)} />
								</InputRightElement>
							</InputGroup>
						</FormControl>
					) : (
						<Button variant="tinted" size="lg" onClick={() => document.getElementById('file').click()}>
							Proof of Payment
						</Button>
					)}

					<chakra.input type="file" id="file" display="none" pointerEvents="none" onChange={handleImage} />

					<Divider />

					<Button type="submit" size="lg" colorScheme="brand" isLoading={isLoading}>
						Place Order
					</Button>
				</Flex>
			</form>
		</Card>
	)
}

export default Controls
