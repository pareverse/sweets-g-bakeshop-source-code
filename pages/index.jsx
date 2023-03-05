import { Container } from '@chakra-ui/react'
import Featured from 'components/featured'
import Ratings from 'components/ratings'
import Contact from 'components/contact'

const Home = () => {
	return (
		<Container>
			<Featured />
			<Ratings />
			<Contact />
		</Container>
	)
}

export default Home
