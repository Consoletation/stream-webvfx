using UnityEngine;
using System.Collections;

public class BaseObject : MonoBehaviour {


	[SerializeField]
	private int m_minTimeToDie = 1;
	[SerializeField]
	private int m_maxTimeToDie = 3;

	void Awake () {

		float px = Random.Range (-10, 10);
		float py = Random.Range (-10, 10);
		float pz = Random.Range (-10, 10);

		transform.position = new Vector3 (px, py, pz);



		transform.rotation = Quaternion.Euler(new Vector3 (0, Random.Range(0,360), 0));

		Destroy (gameObject, Random.Range (m_minTimeToDie, m_maxTimeToDie));



		Renderer rend = gameObject.GetComponent<Renderer> ();
		if (rend != null)
			rend.material.color = Settings.GetRandomColor ();


	}

	[SerializeField]
	private bool m_spin;


	void Update()
	{
		if(m_spin)
			Spin ();

	}



	private float m_spinAcel = 0.3f;
	private float m_spinSpeed = 0;
	private void Spin()
	{
		m_spinSpeed += m_spinAcel;

		Vector3 rot = transform.eulerAngles;
		rot.y += m_spinSpeed;

		transform.rotation = Quaternion.Euler (rot);


		Vector3 pos = transform.position;
		pos.y += 1;
		
		transform.position = pos;

	}



}
