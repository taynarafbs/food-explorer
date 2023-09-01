import { Container } from './styles';

import { Button } from '../../components/Button';


export function Details(){
  return (
    <Container>
        <h1>Hello World!</h1>
        <span>Olá!</span>

       <Button title="Criar Conta" loading />  
       <Button title="Entrar" loading />  
       <Button title="Pedidos"/>  
       <Button title="Incluir"/>  
    </Container>
    
  )
}
